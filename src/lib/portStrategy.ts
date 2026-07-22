export function getPortCandidates(basePort: number, retries: number): number[] {
  return Array.from({ length: retries + 1 }, (_, index) => basePort + index)
}

export function formatPortExhaustedMessage(ports: number[]): string {
  return `${ports.join('/')} 端口全部被占用，运行失败。`
}
