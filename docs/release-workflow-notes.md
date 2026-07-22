# Release workflow notes

## Release assets now published

Bundled CD now creates a real GitHub Release and uploads final artifacts directly instead of relying only on workflow artifact ZIP downloads.

## Published asset types

- Linux: `.deb`, `.rpm`
- Windows: `.exe`
- Android: `.apk`

## Why `.msi` is not on the release

Windows MSI packaging is intentionally not published because the installation layout did not match the desired end-user experience. The current Windows release surface is narrowed to the NSIS installer EXE only.
