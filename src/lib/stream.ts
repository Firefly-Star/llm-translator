import type { ParsedStreamChunk } from './types'

function parseJsonPayload(payload: string): ParsedStreamChunk {
  if (!payload.trim()) {
    return { text: '', done: false }
  }

  const parsed = JSON.parse(payload) as {
    choices?: Array<{
      delta?: { content?: string }
      message?: { content?: string }
      finish_reason?: string | null
    }>
  }

  const choice = parsed.choices?.[0]
  const text = choice?.delta?.content ?? choice?.message?.content ?? ''
  const done = choice?.finish_reason != null

  return { text, done }
}

export function parseStreamChunk(rawChunk: string): ParsedStreamChunk[] {
  const normalized = rawChunk.replace(/\r/g, '')
  const segments = normalized
    .split('\n\n')
    .flatMap((block) => block.split('\n'))
    .map((line) => line.trim())
    .filter(Boolean)

  return segments.flatMap((segment) => {
    if (segment === 'data: [DONE]' || segment === '[DONE]') {
      return [{ text: '', done: true }]
    }

    const payload = segment.startsWith('data:') ? segment.slice(5).trim() : segment

    try {
      return [parseJsonPayload(payload)]
    } catch {
      return []
    }
  })
}
