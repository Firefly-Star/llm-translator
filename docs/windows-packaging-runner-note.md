# Windows packaging runner note

The first GitHub Actions Windows run hit:
- `spawn EINVAL`

## Cause

On GitHub Actions Windows runners, spawning `npx.cmd` directly from Node can fail unless the process is launched through the shell.

## Fix applied

Updated `scripts/package-desktop-windows.mjs` to call:
- `spawn('npx.cmd', ..., { shell: true })`

This keeps the wrapper thin while making the command portable on Windows CI.
