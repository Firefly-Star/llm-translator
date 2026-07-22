import { describe, expect, it } from 'vitest'

import { parseStreamChunk } from './stream'

describe('parseStreamChunk', () => {
  it('parses SSE delta content chunks', () => {
    const chunks = parseStreamChunk(
      'data: {"choices":[{"delta":{"content":"你"},"finish_reason":null}]}\n\n' +
        'data: {"choices":[{"delta":{"content":"好"},"finish_reason":null}]}',
    )

    expect(chunks).toEqual([
      { text: '你', done: false },
      { text: '好', done: false },
    ])
  })

  it('parses message content fallback', () => {
    const chunks = parseStreamChunk('{"choices":[{"message":{"content":"hello"},"finish_reason":"stop"}]}')

    expect(chunks).toEqual([{ text: 'hello', done: true }])
  })

  it('parses done sentinel', () => {
    const chunks = parseStreamChunk('data: [DONE]')
    expect(chunks).toEqual([{ text: '', done: true }])
  })

  it('ignores invalid payloads', () => {
    const chunks = parseStreamChunk('data: not-json')
    expect(chunks).toEqual([])
  })
})
