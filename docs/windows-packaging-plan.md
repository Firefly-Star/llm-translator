# Windows desktop packaging plan

## Goal

Add Windows packaging next, producing:
- `.exe`
- `.msi`

using the same thin Tauri shell and the same frontend build output.

## Strategy

Do **not** attempt Windows packaging from the current Linux/WSL environment as the primary path.
Prefer a Windows-native build environment or a GitHub Actions Windows runner.

## Expected Windows flow later

- `npm ci`
- `npm test`
- `npm run build`
- `npx tauri build --bundles msi,nsis`

## Why this fits the architecture

- Frontend stays in `src/`
- Tauri shell stays in `src-tauri/`
- Packaging logic is platform-specific but thin
- Frontend changes only require rebuild + repackage

## Next checks when starting Windows work

1. Confirm Tauri Windows prerequisites in a Windows environment
2. Add a dedicated Windows packaging script (likely `package:desktop:windows`)
3. Validate `.msi` / `.exe` bundle outputs
4. Then move both Linux and Windows packaging into CI/CD
