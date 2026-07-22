#!/usr/bin/env node
import { spawn } from 'node:child_process'

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const args = ['tauri', 'build', '--bundles', 'deb,rpm']

const child = spawn(command, args, {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
