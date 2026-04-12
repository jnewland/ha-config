# Home Assistant Configuration

[Home Assistant](https://github.com/home-assistant/home-assistant/) is a super cool [open source home automation platform](https://home-assistant.io/). This repository contains the configuration I run at my house.

## Interacting w/ the house

- Walk around. Carry your phone with you. Observe sensors try to do the right thing.
- Use [Siri](./doc/siri.md) when they don't.

## Local Scripts

- `./script/repairs` lists active Home Assistant repair issues using `HASS_URL` and `HASS_TOKEN` from `.env.dev` or `.env`.
- Pass `--json` for machine-readable output, `--all` to include ignored issues, or `--full` to include every returned field plus `issue_data`.
