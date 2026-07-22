import { describe, expect, it } from 'vitest'

import { createConfigDraft, removeConfig, upsertConfig } from './configs'
import type { LlmConfig } from './types'

const firstConfig: LlmConfig = {
  id: '1',
  name: 'one',
  provider: 'Custom',
  baseUrl: 'https://example.com/v1',
  apiKey: 'k1',
  model: 'm1',
  systemPrompt: 's1',
  temperature: 0.2,
}

describe('config helpers', () => {
  it('creates a config draft with predictable values', () => {
    expect(createConfigDraft(3)).toMatchObject({
      id: 'config-3',
      name: '配置 3',
      provider: 'OpenAI-compatible',
    })
  })

  it('appends a config when id does not exist', () => {
    const next = upsertConfig([firstConfig], {
      ...firstConfig,
      id: '2',
      name: 'two',
    })

    expect(next).toHaveLength(2)
    expect(next[1].name).toBe('two')
  })

  it('replaces a config when id already exists', () => {
    const next = upsertConfig([firstConfig], {
      ...firstConfig,
      name: 'updated',
    })

    expect(next).toEqual([
      {
        ...firstConfig,
        name: 'updated',
      },
    ])
  })

  it('removes a config by id', () => {
    expect(
      removeConfig([
        firstConfig,
        {
          ...firstConfig,
          id: '2',
        },
      ], '1'),
    ).toEqual([
      {
        ...firstConfig,
        id: '2',
      },
    ])
  })
})
