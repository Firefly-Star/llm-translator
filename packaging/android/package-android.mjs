#!/usr/bin/env node
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const command = process.platform === 'win32' ? 'gradlew.bat' : './gradlew'
const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '..', '..')
const androidProjectDir = resolve(scriptDir, 'android')

function run(commandName, args, cwd) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(commandName, args, {
      cwd,
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

await run(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['cap', 'sync', 'android'], repoRoot)
await run(command, ['assembleDebug'], androidProjectDir)
