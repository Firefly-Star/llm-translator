# Windows CI packaging job plan

## Goal

Replace the placeholder Windows packaging job in bundled CD with a real `windows-latest` build job.

## Expected command

- `npm run package:desktop:windows`

## Expected bundles

- `msi`
- `nsis`

## Windows runner setup

Use:
- `actions/checkout@v4`
- `actions/setup-node@v4` with Node 22
- `dtolnay/rust-toolchain@stable`

Then:
- `npm ci`
- `npm test`
- `npm run package:desktop:windows`
- upload artifacts from Tauri bundle output

## Artifact paths to try

Typical Tauri Windows bundle paths:
- `src-tauri/target/release/bundle/msi/*.msi`
- `src-tauri/target/release/bundle/nsis/*.exe`

## Important note

We are updating only the workflow layer now. Real success still depends on whether the Tauri Windows runner has everything needed for this app. The workflow should fail honestly if a Windows-specific packaging dependency is still missing.
