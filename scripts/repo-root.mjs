#!/usr/bin/env node
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function getScriptDir(importMetaUrl) {
  return dirname(fileURLToPath(importMetaUrl))
}

export function getRepoRoot(importMetaUrl) {
  const scriptDir = getScriptDir(importMetaUrl)

  if (scriptDir.includes('/packaging/desktop/')) {
    return resolve(scriptDir, '..', '..')
  }

  if (scriptDir.includes('/packaging/android/')) {
    return resolve(scriptDir, '..', '..')
  }

  if (scriptDir.includes('/scripts/')) {
    return resolve(scriptDir, '..')
  }

  return resolve(scriptDir, '..')
}
