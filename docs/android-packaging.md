# Android desktop packaging command surface

## Commands

Web-to-Android sync only:

```bash
npm run android:sync
```

Build debug APK:

```bash
npm run package:android
```

## What `package:android` does

1. `npx cap sync android`
2. runs Gradle `assembleDebug` inside `android/`

## Expected artifact

Typical debug APK path:

- `android/app/build/outputs/apk/debug/app-debug.apk`

## Thin-shell rule

Capacitor and the Android project remain a native shell around the shared frontend build output. Frontend changes should only require rebuild + sync + package.
