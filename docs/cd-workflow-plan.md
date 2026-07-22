# Bundled CD workflow plan

## Release rule

A version may be published only after all three platform packaging jobs succeed:
- Linux desktop
- Windows desktop
- Android APK

## Trigger

Use manual trigger first:
- `workflow_dispatch`

Inputs:
- `version` (required)

This avoids accidental release on every commit and matches the requirement that release should be intentional and bundled.

## Job graph

1. `prepare`
- checkout
- validate version input

2. `package-linux`
- runs on ubuntu-latest
- install Linux build deps
- npm ci
- npm test
- build Linux desktop bundles
- upload artifacts

3. `package-windows`
- placeholder for now
- runs on windows-latest later
- build exe/msi later

4. `package-android`
- placeholder for now
- build APK later

5. `release`
- depends on all three package jobs
- only runs if all three succeed
- create GitHub Release
- attach all artifacts

## Current implementation strategy

Since Windows and Android packaging are not implemented yet, the first CD workflow should be a skeleton with explicit placeholders and comments, not a fake green pipeline. It should document the intended bundled release topology clearly.
