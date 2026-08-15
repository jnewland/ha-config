#!/usr/bin/env python3

"""Find entity references in the local HA config that don't exist on the live system.

Parses every *.yaml config file, extracts entity id references from structural
fields (entity_id/entity/entities/...) and from Jinja templates (states(...),
is_state(...), state_attr(...), expand(...)), then diffs them against
/api/states on the live Home Assistant instance.

This is a heuristic, not a full Jinja/HA config parser: it will miss entity
references built dynamically at runtime, and it only recognizes a known set of
structural keys. It errs toward precision (few false positives) over recall.
"""

from __future__ import annotations

import argparse
import fnmatch
import json
import os
import re
import ssl
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


ENTITY_RE = re.compile(r"^[a-z_][a-z0-9_]*\.[a-z0-9_]+$")

# First string argument to these Jinja functions is an entity id.
TEMPLATE_FUNC_RE = re.compile(
    r"\b(?:states|is_state|state_attr|expand|device_entities|area_entities)\(\s*"
    r"['\"]([a-z_][a-z0-9_]*\.[a-z0-9_]+)['\"]"
)
# states.domain.object_id attribute access.
TEMPLATE_ACCESSOR_RE = re.compile(r"\bstates\.([a-z_][a-z0-9_]*\.[a-z0-9_]+)\b")

# Keys whose value(s) HA treats strictly as entity id(s).
ENTITY_KEYS = {
    "entity_id",
    "entity",
    "entities",
    "include_entities",
    "exclude_entities",
    "lights",
    "trigger_entity_id",
    "trigger_entity_id_off",
}

SKIP_DIRS = {
    ".git",
    ".github",
    ".venv",
    ".vscode",
    ".claude",
    "node_modules",
    "www",
    "custom_components",
    "doc",
    "__pycache__",
}

# Files under these directories are a bare top-level list of entity ids
# (HA's shorthand for `group: {entities: [...]}` via !include_dir_named).
BARE_LIST_DIRS = {"groups"}

# Files under these directories use entity ids as top-level mapping keys
# (customize: !include_dir_merge_named).
TOP_LEVEL_KEY_DIRS = {"customize"}


class HassApiError(RuntimeError):
    pass


@dataclass
class Finding:
    entity_id: str
    file: str
    line: int | None
    context: str


def load_env_file(repo_root: Path) -> str | None:
    for candidate in (repo_root / ".env.dev", repo_root / ".env"):
        if not candidate.exists():
            continue
        for raw_line in candidate.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("export "):
                line = line[7:].strip()
            key, separator, value = line.partition("=")
            if not separator:
                continue
            key = key.strip()
            value = value.strip()
            if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
                value = value[1:-1]
            os.environ.setdefault(key, value)
        return str(candidate)
    return None


def _construct_any(loader: yaml.SafeLoader, tag_suffix: str, node: yaml.Node) -> Any:
    if isinstance(node, yaml.ScalarNode):
        return loader.construct_scalar(node)
    if isinstance(node, yaml.SequenceNode):
        return loader.construct_sequence(node)
    if isinstance(node, yaml.MappingNode):
        return loader.construct_mapping(node)
    return None


class TolerantLoader(yaml.SafeLoader):
    """Parses HA config tags (!include, !env_var, !secret, ...) as their raw value."""


TolerantLoader.add_multi_constructor("!", _construct_any)


def fetch_live_entities(hass_url: str, hass_token: str, timeout: float, insecure: bool) -> set[str]:
    req = urllib.request.Request(
        f"{hass_url.rstrip('/')}/api/states",
        headers={"Authorization": f"Bearer {hass_token}"},
    )
    ctx = ssl._create_unverified_context() if insecure else None
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            data = json.loads(resp.read())
    except urllib.error.URLError as err:
        raise HassApiError(f"Could not reach {hass_url}: {err}") from err
    return {item["entity_id"] for item in data}


def gather_config_files(repo_root: Path, restrict: list[Path] | None) -> list[Path]:
    if restrict:
        files = []
        for p in restrict:
            if p.is_dir():
                files.extend(p.rglob("*.yaml"))
            else:
                files.append(p)
    else:
        files = list(repo_root.rglob("*.yaml"))

    out = []
    for p in files:
        rel_parts = p.resolve().relative_to(repo_root).parts
        if any(part in SKIP_DIRS for part in rel_parts):
            continue
        out.append(p)
    return sorted(set(out))


def _collect_entity_field(key: str, value: Any, findings: list[tuple[str, str]]) -> None:
    """Handle a value found under an ENTITY_KEYS key. Appends (entity_id, context)."""
    if key == "entities" and isinstance(value, dict):
        for k in value.keys():
            if isinstance(k, str) and ENTITY_RE.fullmatch(k):
                findings.append((k, "entities (mapping key)"))
        return

    if isinstance(value, str):
        candidate = value.strip()
        if candidate != "all" and ENTITY_RE.fullmatch(candidate):
            findings.append((candidate, key))
    elif isinstance(value, list):
        for item in value:
            if isinstance(item, str) and ENTITY_RE.fullmatch(item.strip()):
                findings.append((item.strip(), key))


def _collect_template_refs(text: str, findings: list[tuple[str, str]]) -> None:
    if "{{" not in text and "{%" not in text:
        return
    for m in TEMPLATE_FUNC_RE.finditer(text):
        findings.append((m.group(1), "template"))
    for m in TEMPLATE_ACCESSOR_RE.finditer(text):
        findings.append((m.group(1), "template"))


def walk(value: Any, findings: list[tuple[str, str]], include_templates: bool) -> None:
    if isinstance(value, dict):
        for k, v in value.items():
            if isinstance(k, str) and k in ENTITY_KEYS:
                _collect_entity_field(k, v, findings)
            walk(v, findings, include_templates)
    elif isinstance(value, list):
        for item in value:
            walk(item, findings, include_templates)
    elif isinstance(value, str) and include_templates:
        _collect_template_refs(value, findings)


def extract_findings(doc: Any, rel_path: str, include_templates: bool) -> list[tuple[str, str]]:
    raw: list[tuple[str, str]] = []
    top_dir = rel_path.split("/", 1)[0]

    if top_dir in BARE_LIST_DIRS and isinstance(doc, list):
        for item in doc:
            if isinstance(item, str) and ENTITY_RE.fullmatch(item.strip()):
                raw.append((item.strip(), "bare list"))
    elif top_dir in TOP_LEVEL_KEY_DIRS and isinstance(doc, dict):
        for k in doc.keys():
            if isinstance(k, str) and ENTITY_RE.fullmatch(k):
                raw.append((k, "customize key"))

    walk(doc, raw, include_templates)
    return raw


class LineLocator:
    """Maps entity ids to the line(s) they occur on in a file.

    Successive lookups for the same entity id in the same file advance
    through its occurrences in order, so repeated references don't all
    collapse onto the line of the first occurrence. Matching is by plain
    substring (not tokenization) so forms like `states.domain.object_id`
    resolve correctly instead of having their leading `states.` prefix
    swallow the domain segment.
    """

    def __init__(self) -> None:
        self._lines_cache: dict[Path, list[str]] = {}
        self._occurrences_cache: dict[tuple[Path, str], list[int]] = {}
        self._cursors: dict[tuple[Path, str], int] = {}

    def _lines(self, path: Path) -> list[str]:
        if path not in self._lines_cache:
            try:
                self._lines_cache[path] = path.read_text(encoding="utf-8").splitlines()
            except OSError:
                self._lines_cache[path] = []
        return self._lines_cache[path]

    def next_line(self, path: Path, entity_id: str) -> int | None:
        key = (path, entity_id)
        if key not in self._occurrences_cache:
            self._occurrences_cache[key] = [
                lineno for lineno, line in enumerate(self._lines(path), start=1) if entity_id in line
            ]
        occurrences = self._occurrences_cache[key]
        if not occurrences:
            return None
        cursor = self._cursors.get(key, 0)
        lineno = occurrences[min(cursor, len(occurrences) - 1)]
        self._cursors[key] = cursor + 1
        return lineno


def load_ignore_patterns(path: Path | None) -> list[str]:
    if not path or not path.exists():
        return []
    patterns = []
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.split("#", 1)[0].strip()
        if not line:
            continue
        patterns.append(line)
    return patterns


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Find entity references in local HA config missing from the live system."
    )
    parser.add_argument(
        "paths",
        nargs="*",
        type=Path,
        help="Limit scanning to these files/directories (default: whole repo).",
    )
    parser.add_argument("--json", action="store_true", help="Print findings as JSON.")
    parser.add_argument(
        "--no-templates",
        action="store_true",
        help="Skip scanning Jinja templates (states()/is_state()/state_attr()/expand()).",
    )
    parser.add_argument("--insecure", action="store_true", help="Disable TLS certificate verification.")
    parser.add_argument("--timeout", type=float, default=15.0, help="HTTP timeout in seconds. Default: 15.")
    parser.add_argument(
        "--ignore-file",
        type=Path,
        default=None,
        help="File of entity ids/globs to ignore, one per line. Default: .lintentitiesignore if present.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo_root = Path(__file__).resolve().parent.parent
    env_file = load_env_file(repo_root)

    hass_url = os.environ.get("HASS_URL")
    hass_token = os.environ.get("HASS_TOKEN")
    if not hass_url or not hass_token:
        missing = [n for n, v in (("HASS_URL", hass_url), ("HASS_TOKEN", hass_token)) if not v]
        source = env_file or "environment"
        raise SystemExit(f"Missing {', '.join(missing)}. Set them in the environment or in {source}.")

    try:
        live_entities = fetch_live_entities(hass_url, hass_token, args.timeout, args.insecure)
    except HassApiError as err:
        raise SystemExit(f"Error: {err}") from err
    print(f"Fetched {len(live_entities)} live entities from {hass_url}.", file=sys.stderr)

    ignore_path = args.ignore_file or (repo_root / ".lintentitiesignore")
    ignore_patterns = load_ignore_patterns(ignore_path)

    restrict = [p.resolve() for p in args.paths] if args.paths else None
    files = gather_config_files(repo_root, restrict)

    findings: dict[str, list[Finding]] = {}
    parse_errors: list[tuple[str, str]] = []
    locator = LineLocator()

    for path in files:
        rel_path = path.relative_to(repo_root).as_posix()
        try:
            text = path.read_text(encoding="utf-8")
            doc = yaml.load(text, Loader=TolerantLoader)
        except (yaml.YAMLError, OSError, UnicodeDecodeError) as err:
            parse_errors.append((rel_path, str(err)))
            continue

        seen: set[tuple[str, int | None, str]] = set()
        for entity_id, context in extract_findings(doc, rel_path, not args.no_templates):
            if entity_id in live_entities:
                continue
            if any(fnmatch.fnmatch(entity_id, pat) for pat in ignore_patterns):
                continue
            line = locator.next_line(path, entity_id)
            key = (entity_id, line, context)
            if key in seen:
                continue
            seen.add(key)
            findings.setdefault(entity_id, []).append(Finding(entity_id, rel_path, line, context))

    for rel_path, err in parse_errors:
        print(f"warning: could not parse {rel_path}: {err}", file=sys.stderr)

    if args.json:
        out = [
            {
                "entity_id": entity_id,
                "locations": [
                    {"file": f.file, "line": f.line, "context": f.context} for f in locs
                ],
            }
            for entity_id, locs in sorted(findings.items())
        ]
        print(json.dumps(out, indent=2))
    elif not findings:
        print("No dangling entity references found.")
    else:
        print(f"Found {len(findings)} entity id(s) referenced in config but missing from the live system:\n")
        for entity_id, locs in sorted(findings.items()):
            print(f"- {entity_id}")
            for f in sorted(locs, key=lambda x: (x.file, x.line or 0)):
                where = f"{f.file}:{f.line}" if f.line else f.file
                print(f"    {where}  [{f.context}]")

    return 1 if (findings or parse_errors) else 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except HassApiError as err:
        print(f"Error: {err}", file=sys.stderr)
        raise SystemExit(1) from err
