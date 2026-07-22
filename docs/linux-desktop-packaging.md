# Linux desktop packaging

## Stable command

Use this command for Linux desktop release packaging:

```bash
cd /home/wxz/llm-translator
npm run package:desktop:linux
```

This intentionally packages only:
- deb
- rpm

It does **not** attempt AppImage, because AppImage bundling is currently less stable on this machine due to the extra linuxdeploy stage.

## Produced artifacts

Expected output directory:

- `src-tauri/target/release/bundle/deb/`
- `src-tauri/target/release/bundle/rpm/`

Typical files:
- `LLM Translator_0.1.0_amd64.deb`
- `LLM Translator-0.1.0-1.x86_64.rpm`

## Development commands

- Web dev only: `npm run dev`
- Desktop dev shell: `npm run tauri:dev`
- Full Tauri build (all configured bundles): `npm run tauri:build`
- Stable Linux packaging: `npm run package:desktop:linux`

## Why this is CI/CD-friendly

Frontend changes only require rerunning the packaging command. The Tauri shell remains thin and consumes the web build output automatically via `beforeBuildCommand`.
