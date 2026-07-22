# Android packaging plan

## Goal

Add a thin Capacitor Android shell that consumes the same frontend build output and produces APK artifacts in CI.

## Architecture

- Frontend source of truth: `src/`
- Web build output: `dist/`
- Capacitor config at repo root
- Native Android project under `android/`

## Commands we want

- `npm run build` -> web only
- `npm run android:sync` -> sync web build into Capacitor Android project
- `npm run package:android` -> build debug APK from the Android project

## Thin-shell rule

- No business logic in Android native layer
- Capacitor only loads the built web app
- Frontend changes only require rebuild + sync + package

## CI target

The bundled CD `package-android` job should eventually:
- setup Node
- setup Java
- install Android SDK/build tools
- npm ci
- npm test
- npm run package:android
- upload APK artifacts
