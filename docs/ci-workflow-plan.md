# CI workflow plan

## Goal

Every commit and pull request should be validated by automated checks, but packaging should remain separate.

## Trigger

- `push`
- `pull_request`

## CI scope

Run only lightweight quality gates required on every commit:
- `npm ci`
- `npm test`
- `npm run build`

## Why no packaging here

Desktop/mobile packaging is slower and should only run for version candidates. Keeping CI limited to test + build makes per-commit validation fast and strict.

## Runner

- `ubuntu-latest`

This is sufficient for the current frontend CI stage because it only needs Node and npm.
