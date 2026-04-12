# Home Assistant Configuration

[Home Assistant](https://github.com/home-assistant/home-assistant/) is a super cool [open source home automation platform](https://home-assistant.io/). This repository contains the configuration I run at my house.

## Interacting w/ the house

- Walk around. Carry your phone with you. Observe sensors try to do the right thing.
- Use [Siri](./doc/siri.md) when they don't.

## Local Scripts

- `requirements.txt` pins the Home Assistant version used for local validation.
- `./script/bootstrap` creates or updates `.venv` and installs the pinned Home Assistant version from `requirements.txt`.
- `./script/cibuild` validates the config with Home Assistant from `.venv`, requires `.env`, and fails if the installed Home Assistant version does not match `requirements.txt`. When `CI` is set, it skips that version check and uses `hass` from the CI environment.
- `./script/repairs` lists active Home Assistant repair issues using `HASS_URL` and `HASS_TOKEN` from `.env.dev` or `.env`.
- Pass `--json` for machine-readable output, `--all` to include ignored issues, or `--full` to include every returned field plus `issue_data`.
