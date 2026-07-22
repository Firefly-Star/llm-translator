# Windows packaging script plan

## Goal

Prepare a stable command surface for future Windows desktop packaging without requiring frontend business logic changes.

## Intended command

- `npm run package:desktop:windows`

## Intended bundle targets

Use Tauri Windows bundles:
- `msi`
- `nsis`

This maps well to the desired `msi` + installer exe delivery.

## Current constraint

The current machine is Linux/WSL, so this command is only a placeholder/wrapper definition for now. Actual validation should happen on:
- Windows native machine
- or GitHub Actions `windows-latest`

## Architecture rule

The script should remain thin, just like Linux packaging:
- invoke Tauri CLI
- specify Windows bundle targets
- rely on the same frontend build via `beforeBuildCommand`

## Future CI shape

Windows workflow job should eventually run:
- `npm ci`
- `npm test`
- `npm run package:desktop:windows`
