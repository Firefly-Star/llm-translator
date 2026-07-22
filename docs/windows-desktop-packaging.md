# Windows desktop packaging

## Stable command surface

Use this command in a Windows environment:

```bash
npm run package:desktop:windows
```

## Intended outputs

This command is designed to request Tauri Windows bundles:
- `msi`
- `nsis`

That corresponds to:
- MSI installer
- NSIS-based installer EXE

## Current behavior on non-Windows hosts

If run on Linux/WSL, the wrapper exits immediately with a clear message instead of pretending to work. This keeps the packaging layer honest and CI-friendly.

## Future usage

- Local Windows machine
- or GitHub Actions `windows-latest`

## Thin-shell rule

The script only invokes Tauri packaging. It does not contain business logic. Frontend changes remain isolated to the Vite app and are consumed by Tauri through the existing build pipeline.
