# Tauri packaging plan

## Goal

Add a thin Tauri desktop shell that only loads the Vite frontend build output. The frontend remains the single source of truth. Future frontend changes should not require shell logic changes.

## Architecture

- Frontend app: `src/` + Vite build to `dist/`
- Desktop shell: `src-tauri/`
- Tauri points at `../dist` for production assets
- Dev mode points at the Vite dev server URL

## Commands we want

- `npm run build` -> build web only
- `npm run tauri:dev` -> run desktop app against frontend dev server
- `npm run tauri:build` -> build web first, then package desktop app

## Thin-shell rules

- No business logic in Rust
- No duplicated UI in Tauri
- App metadata and packaging config only in `src-tauri`
- Frontend changes should only require rebuilding and repackaging

## Verification checkpoints

1. Tauri CLI installed as a dev dependency
2. `src-tauri/tauri.conf.json` points to `../dist`
3. `npm run tauri:build` exists
4. `cargo check` passes in `src-tauri`
5. Tauri build command at least reaches bundling stage on this machine, or reports a specific missing system package if blocked
