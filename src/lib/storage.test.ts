import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_STORAGE, STORAGE_KEY } from './constants'
import { loadAppStorage, saveAppStorage } from './storage'

function createStorageMock(initialValue: string | null = null) {
  let value = initialValue

  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_, nextValue: string) => {
      value = nextValue
    }),
  }
}

describe('storage helpers', () => {
  it('loads default storage when storage is empty', () => {
    const storage = createStorageMock()

    expect(loadAppStorage(storage)).toEqual(DEFAULT_STORAGE)
    expect(storage.getItem).toHaveBeenCalledWith(STORAGE_KEY)
  })

  it('loads sanitized storage from localStorage', () => {
    const storage = createStorageMock(
      JSON.stringify({
        configs: [
          {
            id: 'c1',
            name: 'config 1',
            provider: 'Custom',
            baseUrl: 'https://example.com/v1',
            apiKey: 'abc',
            model: 'model-x',
            systemPrompt: 'translate please',
            temperature: 0.5,
          },
        ],
        activeConfigId: 'c1',
        autoTranslateDelaySeconds: 5,
        sourceLanguage: 'en',
        targetLanguage: 'de',
        sourceText: 'source',
        targetText: 'target',
      }),
    )

    expect(loadAppStorage(storage)).toEqual({
      configs: [
        {
          id: 'c1',
          name: 'config 1',
          provider: 'Custom',
          baseUrl: 'https://example.com/v1',
          apiKey: 'abc',
          model: 'model-x',
          systemPrompt: 'translate please',
          temperature: 0.5,
        },
      ],
      activeConfigId: 'c1',
      autoTranslateDelaySeconds: 5,
      sourceLanguage: 'en',
      targetLanguage: 'de',
      sourceText: 'source',
      targetText: 'target',
    })
  })

  it('falls back to defaults when JSON is broken', () => {
    const storage = createStorageMock('{broken')
    expect(loadAppStorage(storage)).toEqual(DEFAULT_STORAGE)
  })

  it('saves storage into localStorage', () => {
    const storage = createStorageMock()

    saveAppStorage(storage, DEFAULT_STORAGE)

    expect(storage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(DEFAULT_STORAGE))
  })
})
