import net from 'node:net'
import { spawn } from 'node:child_process'

function getPortCandidates(basePort, retries) {
  return Array.from({ length: retries + 1 }, (_, index) => basePort + index)
}

function formatPortExhaustedMessage(ports) {
  return `${ports.join('/')} 端口全部被占用，运行失败。`
}

function canListen(port, host = '0.0.0.0') {
  return new Promise((resolve) => {
    const server = net.createServer()

    server.once('error', () => {
      resolve(false)
    })

    server.once('listening', () => {
      server.close(() => resolve(true))
    })

    server.listen(port, host)
  })
}

async function pickAvailablePort(basePort, retries) {
  const candidates = getPortCandidates(basePort, retries)

  for (const port of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const available = await canListen(port)
    if (available) {
      return { port, candidates }
    }
  }

  return { port: null, candidates }
}

async function main() {
  const basePort = Number(process.env.PORT ?? '5173')
  const retries = Number(process.env.PORT_RETRIES ?? '4')
  const { port, candidates } = await pickAvailablePort(basePort, retries)

  if (port === null) {
    console.error(formatPortExhaustedMessage(candidates))
    process.exit(1)
  }

  console.log(`使用端口 ${port} 启动开发服务器`) 

  const child = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['vite', '--host', '0.0.0.0', '--port', String(port), '--strictPort'],
    {
      stdio: 'inherit',
      env: process.env,
    },
  )

  child.on('exit', (code) => {
    process.exit(code ?? 0)
  })
}

void main()
