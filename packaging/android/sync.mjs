#!/usr/bin/env node
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '..', '..')

function run(commandName, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(commandName, args, {
      cwd: repoRoot,
      stdio: 'inherit',
      env: process.env,
      shell: process.platform === 'win32',
    })

    child.on('exit', (code) => {
      if ((code ?? 0) === 0) {
        resolvePromise(undefined)
      } else {
        reject(new Error(`${commandName} ${args.join(' ')} failed with exit code ${code}`))
      }
    })
  })
}

await run(command, ['cap', 'sync', 'android'])
