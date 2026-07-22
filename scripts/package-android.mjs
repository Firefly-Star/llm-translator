#!/usr/bin/env node
import { spawn } from 'node:child_process'

const command = process.platform === 'win32' ? 'gradlew.bat' : './gradlew'

function run(commandName, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(commandName, args, {
      cwd,
      stdio: 'inherit',
      env: process.env,
      shell: process.platform === 'win32',
    })

    child.on('exit', (code) => {
      if ((code ?? 0) === 0) {
        resolve(undefined)
      } else {
        reject(new Error(`${commandName} ${args.join(' ')} failed with exit code ${code}`))
      }
    })
  })
}

await run(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['cap', 'sync', 'android'], process.cwd())
await run(command, ['assembleDebug'], `${process.cwd()}/android`)
