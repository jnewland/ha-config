#!/usr/bin/env python3

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import socket
import ssl
import struct
import sys
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


SEVERITY_ORDER = {
    "critical": 0,
    "error": 1,
    "warning": 2,
    "other": 3,
}

DISPLAY_FIELD_ORDER = [
    "severity",
    "domain",
    "issue_id",
    "issue_domain",
    "is_fixable",
    "ignored",
    "created",
    "dismissed_version",
    "breaks_in_ha_version",
    "learn_more_url",
    "translation_key",
    "translation_placeholders",
    "issue_data",
]


class HomeAssistantWebSocketError(RuntimeError):
    """Raised when websocket communication with Home Assistant fails."""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="List Home Assistant repair issues via the websocket API."
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Include ignored repair issues in the output.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print the resulting issues as JSON.",
    )
    parser.add_argument(
        "--full",
        action="store_true",
        help="Include all issue fields and fetch issue_data when available.",
    )
    parser.add_argument(
        "--insecure",
        action="store_true",
        help="Disable TLS certificate verification.",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=15.0,
        help="Socket timeout in seconds. Default: 15.",
    )
    return parser.parse_args()


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


def websocket_url_from_hass_url(hass_url: str) -> tuple[str, str, int, str]:
    parsed = urlparse(hass_url)
    if parsed.scheme not in {"http", "https", "ws", "wss"}:
        raise HomeAssistantWebSocketError(
            f"Unsupported HASS_URL scheme: {parsed.scheme or 'missing'}"
        )
    if not parsed.hostname:
        raise HomeAssistantWebSocketError("HASS_URL must include a hostname")

    secure = parsed.scheme in {"https", "wss"}
    scheme = "wss" if secure else "ws"
    port = parsed.port or (443 if secure else 80)
    base_path = parsed.path.rstrip("/")
    resource = f"{base_path}/api/websocket" if base_path else "/api/websocket"
    return scheme, parsed.hostname, port, resource


class WebSocketClient:
    def __init__(
        self,
        hass_url: str,
        timeout: float,
        insecure: bool = False,
    ) -> None:
        self.scheme, self.host, self.port, self.resource = websocket_url_from_hass_url(
            hass_url
        )
        self.timeout = timeout
        self.insecure = insecure
        self.sock: socket.socket | ssl.SSLSocket | None = None
        self._pending = b""

    def connect(self) -> None:
        raw_socket = socket.create_connection((self.host, self.port), self.timeout)
        raw_socket.settimeout(self.timeout)

        if self.scheme == "wss":
            context = ssl.create_default_context()
            if self.insecure:
                context.check_hostname = False
                context.verify_mode = ssl.CERT_NONE
            self.sock = context.wrap_socket(raw_socket, server_hostname=self.host)
        else:
            self.sock = raw_socket

        request_key = base64.b64encode(os.urandom(16)).decode("ascii")
        host_header = self.host
        if (self.scheme == "ws" and self.port != 80) or (
            self.scheme == "wss" and self.port != 443
        ):
            host_header = f"{host_header}:{self.port}"

        request = "\r\n".join(
            [
                f"GET {self.resource} HTTP/1.1",
                f"Host: {host_header}",
                "Upgrade: websocket",
                "Connection: Upgrade",
                f"Sec-WebSocket-Key: {request_key}",
                "Sec-WebSocket-Version: 13",
                "\r\n",
            ]
        )
        self.sock.sendall(request.encode("ascii"))

        header_bytes = self._recv_until(b"\r\n\r\n")
        header_text = header_bytes.decode("utf-8", errors="replace")
        status_line = header_text.split("\r\n", 1)[0]
        if " 101 " not in status_line:
            raise HomeAssistantWebSocketError(
                f"WebSocket upgrade failed: {status_line}"
            )

        headers = {}
        for line in header_text.split("\r\n")[1:]:
            if not line or ":" not in line:
                continue
            name, value = line.split(":", 1)
            headers[name.strip().lower()] = value.strip()

        expected_accept = base64.b64encode(
            hashlib.sha1(
                (
                    request_key
                    + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
                ).encode("ascii")
            ).digest()
        ).decode("ascii")
        actual_accept = headers.get("sec-websocket-accept")
        if actual_accept != expected_accept:
            raise HomeAssistantWebSocketError("Invalid websocket accept header")

    def close(self) -> None:
        if self.sock is None:
            return
        try:
            self._send_frame(b"", opcode=0x8)
        except OSError:
            pass
        try:
            self.sock.close()
        finally:
            self.sock = None

    def send_json(self, payload: dict[str, Any]) -> None:
        self._send_frame(json.dumps(payload, separators=(",", ":")).encode("utf-8"))

    def recv_json(self) -> dict[str, Any]:
        while True:
            opcode, payload = self._recv_frame()
            if opcode == 0x1:
                return json.loads(payload.decode("utf-8"))
            if opcode == 0x8:
                raise HomeAssistantWebSocketError("WebSocket closed by server")
            if opcode == 0x9:
                self._send_frame(payload, opcode=0xA)
                continue
            if opcode == 0xA:
                continue
            raise HomeAssistantWebSocketError(
                f"Unsupported websocket opcode received: {opcode}"
            )

    def call_json(self, payload: dict[str, Any]) -> dict[str, Any]:
        self.send_json(payload)
        request_id = payload.get("id")
        while True:
            message = self.recv_json()
            if message.get("type") != "result" or message.get("id") != request_id:
                continue
            if not message.get("success"):
                error = message.get("error", {})
                raise HomeAssistantWebSocketError(
                    error.get("message") or f"{payload['type']} failed"
                )
            return message.get("result") or {}

    def _recv_until(self, marker: bytes) -> bytes:
        assert self.sock is not None
        buffer = bytearray()
        while marker not in buffer:
            chunk = self.sock.recv(4096)
            if not chunk:
                raise HomeAssistantWebSocketError(
                    "Connection closed while waiting for websocket handshake"
                )
            buffer.extend(chunk)
        index = buffer.index(marker) + len(marker)
        header = bytes(buffer[:index])
        remainder = bytes(buffer[index:])
        self._pending = remainder
        return header

    def _recv_exact(self, size: int) -> bytes:
        assert self.sock is not None
        pending = getattr(self, "_pending", b"")
        if pending:
            chunk = pending[:size]
            self._pending = pending[size:]
            if len(chunk) == size:
                return chunk
            remaining = size - len(chunk)
        else:
            chunk = b""
            remaining = size

        parts = [chunk]
        while remaining > 0:
            data = self.sock.recv(remaining)
            if not data:
                raise HomeAssistantWebSocketError("Connection closed while reading frame")
            parts.append(data)
            remaining -= len(data)
        return b"".join(parts)

    def _recv_frame(self) -> tuple[int, bytes]:
        first_byte, second_byte = self._recv_exact(2)
        fin = bool(first_byte & 0x80)
        opcode = first_byte & 0x0F
        masked = bool(second_byte & 0x80)
        length = second_byte & 0x7F

        if length == 126:
            length = struct.unpack("!H", self._recv_exact(2))[0]
        elif length == 127:
            length = struct.unpack("!Q", self._recv_exact(8))[0]

        mask = self._recv_exact(4) if masked else b""
        payload = bytearray(self._recv_exact(length))
        if masked:
            for index in range(length):
                payload[index] ^= mask[index % 4]
        if not fin:
            raise HomeAssistantWebSocketError("Fragmented websocket frames are unsupported")
        return opcode, bytes(payload)

    def _send_frame(self, payload: bytes, opcode: int = 0x1) -> None:
        assert self.sock is not None
        first_byte = 0x80 | opcode
        mask = os.urandom(4)
        length = len(payload)

        if length < 126:
            header = bytes([first_byte, 0x80 | length])
        elif length < 2**16:
            header = bytes([first_byte, 0x80 | 126]) + struct.pack("!H", length)
        else:
            header = bytes([first_byte, 0x80 | 127]) + struct.pack("!Q", length)

        masked_payload = bytes(
            byte ^ mask[index % 4] for index, byte in enumerate(payload)
        )
        self.sock.sendall(header + mask + masked_payload)


def fetch_repairs(
    hass_url: str,
    hass_token: str,
    timeout: float,
    insecure: bool,
    include_issue_data: bool,
) -> list[dict[str, Any]]:
    client = WebSocketClient(hass_url=hass_url, timeout=timeout, insecure=insecure)
    try:
        client.connect()
        hello = client.recv_json()
        if hello.get("type") != "auth_required":
            raise HomeAssistantWebSocketError(
                f"Unexpected websocket greeting: {hello.get('type')}"
            )

        client.send_json({"type": "auth", "access_token": hass_token})
        auth_response = client.recv_json()
        if auth_response.get("type") != "auth_ok":
            raise HomeAssistantWebSocketError(
                auth_response.get("message")
                or auth_response.get("type")
                or "Authentication failed"
            )

        request_id = 1
        result = client.call_json({"id": request_id, "type": "repairs/list_issues"})
        issues = result.get("issues") or []

        if include_issue_data:
            for issue in issues:
                request_id += 1
                issue_result = client.call_json(
                    {
                        "id": request_id,
                        "type": "repairs/get_issue_data",
                        "domain": issue["domain"],
                        "issue_id": issue["issue_id"],
                    }
                )
                issue["issue_data"] = issue_result.get("issue_data")

        return issues
    finally:
        client.close()


def format_value(value: Any) -> str:
    if isinstance(value, str):
        return value
    return json.dumps(value, sort_keys=True)


def iter_issue_fields(issue: dict[str, Any]) -> list[tuple[str, Any]]:
    ordered_fields: list[tuple[str, Any]] = []
    seen = set()

    for key in DISPLAY_FIELD_ORDER:
        if key in issue:
            ordered_fields.append((key, issue[key]))
            seen.add(key)

    for key in sorted(issue):
        if key in seen:
            continue
        ordered_fields.append((key, issue[key]))

    return ordered_fields


def format_issue(issue: dict[str, Any], show_ignored: bool, full: bool) -> list[str]:
    label = f"{issue['domain']}.{issue['issue_id']}"

    if full:
        lines = [f"- {label}"]
        for key, value in iter_issue_fields(issue):
            lines.append(f"  {key}: {format_value(value)}")
        return lines

    lines = [f"- [{issue.get('severity', 'unknown')}] {label}"]
    lines.append(f"  fixable: {'yes' if issue.get('is_fixable') else 'no'}")

    if issue.get("translation_key") and issue["translation_key"] != issue["issue_id"]:
        lines.append(f"  translation_key: {issue['translation_key']}")
    if issue.get("created"):
        lines.append(f"  created: {issue['created']}")
    if issue.get("breaks_in_ha_version"):
        lines.append(f"  breaks_in_ha_version: {issue['breaks_in_ha_version']}")
    if issue.get("learn_more_url"):
        lines.append(f"  learn_more_url: {issue['learn_more_url']}")
    if show_ignored and issue.get("ignored"):
        dismissed = issue.get("dismissed_version") or "unknown"
        lines.append(f"  ignored: yes (dismissed in {dismissed})")
    return lines


def main() -> int:
    args = parse_args()
    repo_root = Path(__file__).resolve().parent.parent
    env_file = load_env_file(repo_root)

    hass_url = os.environ.get("HASS_URL")
    hass_token = os.environ.get("HASS_TOKEN")

    if not hass_url or not hass_token:
        missing = []
        if not hass_url:
            missing.append("HASS_URL")
        if not hass_token:
            missing.append("HASS_TOKEN")
        source = env_file or "environment"
        raise SystemExit(
            f"Missing {', '.join(missing)}. Set them in the environment or in {source}."
        )

    issues = fetch_repairs(
        hass_url=hass_url,
        hass_token=hass_token,
        timeout=args.timeout,
        insecure=args.insecure,
        include_issue_data=args.full,
    )
    issues.sort(
        key=lambda issue: (
            SEVERITY_ORDER.get(issue.get("severity"), 99),
            issue["domain"],
            issue["issue_id"],
        )
    )

    if not args.all:
        issues = [issue for issue in issues if not issue.get("ignored")]

    if args.json:
        print(json.dumps(issues, indent=2, sort_keys=True))
        return 0

    if not issues:
        print("No repair issues found.")
        return 0

    print(f"Found {len(issues)} repair issue(s).")
    for issue in issues:
        print("\n".join(format_issue(issue, show_ignored=args.all, full=args.full)))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except HomeAssistantWebSocketError as err:
        print(f"Error: {err}", file=sys.stderr)
        raise SystemExit(1) from err
