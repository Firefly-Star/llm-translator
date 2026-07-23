# Release artifact path bug note

After moving the Android native project under `packaging/android/android/`, the bundled CD workflow still uploaded APK artifacts from the old path:

- `android/app/build/outputs/apk/debug/*.apk`

The correct path is:

- `packaging/android/android/app/build/outputs/apk/debug/*.apk`

This mismatch caused the release stage to fail when trying to download the Android artifact by name, because the upload step had no matching files to upload.
