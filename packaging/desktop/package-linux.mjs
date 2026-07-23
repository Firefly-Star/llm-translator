#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { getRepoRoot } from '../../scripts/repo-root.mjs'

const repoRoot = getRepoRoot(import.meta.url)
const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const args = ['tauri', 'build', '--bundles', 'deb,rpm']

const child = spawn(command, args, {
  cwd: repoRoot,
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
