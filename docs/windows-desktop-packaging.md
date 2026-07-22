# Windows desktop packaging

## Stable command surface

Use this command in a Windows environment:

```bash
npm run package:desktop:windows
```

## Intended outputs

This command currently requests only the Tauri Windows NSIS bundle:
- `nsis`

The release workflow intentionally publishes the NSIS installer EXE as the Windows deliverable.

## Why MSI is removed

MSI installation layout did not match the desired end-user experience, so the Windows public delivery target is switched to NSIS installer EXE only.

## Current behavior on non-Windows hosts

If run on Linux/WSL, the wrapper exits immediately with a clear message instead of pretending to work. This keeps the packaging layer honest and CI-friendly.

## Future usage

- Local Windows machine
- or GitHub Actions `windows-latest`

## Thin-shell rule

The script only invokes Tauri packaging. It does not contain business logic. Frontend changes remain isolated to the Vite app and are consumed by Tauri through the existing build pipeline.
