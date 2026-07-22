import { describe, expect, it } from 'vitest'

import { formatPortExhaustedMessage, getPortCandidates } from './portStrategy'

describe('portStrategy', () => {
  it('builds default avoidance candidates as base port plus retries', () => {
    expect(getPortCandidates(5173, 4)).toEqual([5173, 5174, 5175, 5176, 5177])
  })

  it('formats exhaustion message exactly', () => {
    expect(formatPortExhaustedMessage([5173, 5174, 5175, 5176, 5177])).toBe(
      '5173/5174/5175/5176/5177 端口全部被占用，运行失败。',
    )
  })
})
