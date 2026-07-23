# Structure refactor plan

## Target shape

```text
llm-translator/
├─ src/                        # frontend app source of truth
├─ public/
├─ packaging/
│  ├─ desktop/
│  │  ├─ tauri/               # current src-tauri
│  │  ├─ package-linux.mjs
│  │  └─ package-windows.mjs
│  └─ android/
│     ├─ android/             # current android native project
│     ├─ sync.mjs
│     └─ package-android.mjs
├─ .github/workflows/
├─ docs/
├─ package.json
├─ package-lock.json
├─ README.md
├─ vite.config.ts
├─ tsconfig*.json
└─ shared root config files
```

## Keep at repo root

- `package.json`
- `package-lock.json`
- `README.md`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `.gitignore`
- `.oxlintrc.json`
- `.github/`
- `index.html`
- `public/`
- `src/`
- `capacitor.config.ts` (keep root to avoid fighting tool defaults)

## Move into packaging layer

- `src-tauri/` -> `packaging/desktop/tauri/`
- `android/` -> `packaging/android/android/`
- `scripts/package-desktop-linux.mjs` -> `packaging/desktop/package-linux.mjs`
- `scripts/package-desktop-windows.mjs` -> `packaging/desktop/package-windows.mjs`
- `scripts/android-sync.mjs` -> `packaging/android/sync.mjs`
- `scripts/package-android.mjs` -> `packaging/android/package-android.mjs`

## Update references

Need to update:
- package scripts in `package.json`
- Tauri config paths
- Android packaging script cwd
- GitHub Actions paths for artifacts
- docs paths and examples

## Verification targets

- `npm test`
- `npm run build`
- `npm run package:desktop:linux`
- `npm run android:sync`
