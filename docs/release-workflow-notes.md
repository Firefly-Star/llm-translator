# Release workflow notes

## Release assets now published

Bundled CD now creates a real GitHub Release and uploads final artifacts directly instead of relying only on workflow artifact ZIP downloads.

## Published asset types

- Linux: `.deb`, `.rpm`
- Windows: `.msi`
- Android: `.apk`

## Why `.exe` is not on the release

Windows NSIS `.exe` packaging is intentionally not published for now while MSI installation layout is being refined. The current release surface is narrowed to the requested assets only.
