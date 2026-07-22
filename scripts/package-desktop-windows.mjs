#!/usr/bin/env node
import { spawn } from 'node:child_process'

if (process.platform !== 'win32') {
  console.error('package:desktop:windows 需要在 Windows 环境中运行。')
  process.exit(1)
}

const command = 'npx.cmd'
const args = ['tauri', 'build', '--bundles', 'msi']

const child = spawn(command, args, {
  stdio: 'inherit',
  env: process.env,
  shell: true,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
