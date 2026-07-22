# Android CI note

The first Android CI run failed because `package:android` expects the built web assets in `dist/`, but the workflow only installed dependencies and ran tests before packaging.

## Fix applied

Added an explicit web build step before Android packaging:

- `npm run build`
- then `npm run package:android`

## Why

Capacitor `sync` consumes the built web directory, not the raw source tree.
