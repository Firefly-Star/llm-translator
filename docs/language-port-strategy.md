# language + port strategy

## 1. Target language selection

Add a persistent `targetLanguage` field to app storage.
Default value: `zh-CN`.

UI:
- Add a dropdown in the top toolbar named `目标语言`
- Include common languages first:
  - 中文
  - English
  - 日本語
  - Deutsch
  - Español
  - Français
  - Italiano
  - Português
  - Русский
  - 한국어
  - العربية
- Then include a larger built-in list of additional languages supported as static options.

Prompting strategy:
- Keep system prompt configurable per profile.
- Prepend a deterministic instruction in the user message:
  - `Translate the following text into <language>. Return only the translation unless the user explicitly asks otherwise.`
- This avoids relying on the model to infer target language.

## 2. Port avoidance for npm run dev

Need an explicit startup script instead of raw `vite`.

Behavior:
- default base port 5173
- attempt ports: 5173, 5174, 5175, 5176, 5177
- total 5 tries = initial + 4 avoidance retries
- if one is free, start Vite on that port with `strictPort: true`
- if all are occupied, print:
  - `5173/5174/5175/5176/5177 端口全部被占用，运行失败。`
  and exit with non-zero code

Implementation approach:
- create `scripts/dev-with-port.mjs`
- use Node `net` module to probe ports
- spawn `vite --host 0.0.0.0 --port <freePort> --strictPort`

Verification approach:
- unit-test pure helper that computes attempted port list and exhaustion message
- run real script once in normal case
- run a temporary port occupation experiment over 5173-5177, then run script to confirm the failure message

## 3. Mobile viability of current stack

Current stack is Vite + React + TypeScript.
This cannot run as `npm` directly on a phone in the normal end-user sense.
What can run on a phone is the built frontend bundle produced by Vite:
- static HTML/CSS/JS in browser
- later wrapped as PWA
- later wrapped via Capacitor into Android app

So the correct statement is:
- `npm` is only the development/build toolchain on desktop
- the generated web app can be migrated to mobile delivery without replacing the frontend stack
