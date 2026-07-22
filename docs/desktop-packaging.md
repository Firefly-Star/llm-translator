# Desktop packaging with Tauri

## Thin-shell contract

- Frontend source of truth: `src/`
- Frontend production output: `dist/`
- Desktop shell only: `src-tauri/`
- Desktop build command: `npm run tauri:build`

## Development

- Web-only dev: `npm run dev`
- Desktop dev shell: `npm run tauri:dev`

`tauri:dev` starts the frontend dev server through the Tauri `beforeDevCommand` and opens the desktop window against the dev URL.

## Production packaging

`npm run tauri:build`

This runs:
1. `npm run build` via Tauri `beforeBuildCommand`
2. Tauri packaging against `../dist`

Meaning frontend changes only require rebuilding and repackaging. No Rust business logic changes are needed for normal UI work.

## CI/CD shape later

A future desktop workflow should simply run:
- `npm ci`
- `npm test`
- `npm run tauri:build`

The shell remains stable while frontend evolves.
