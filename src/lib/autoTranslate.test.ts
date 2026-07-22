import { describe, expect, it } from 'vitest'

import { shouldAutoTranslate } from './autoTranslate'

describe('shouldAutoTranslate', () => {
  it('returns false when there is no active config', () => {
    expect(
      shouldAutoTranslate({
        sourceText: 'hello',
        lastRequestedText: '',
        hasActiveConfig: false,
      }),
    ).toBe(false)
  })

  it('returns false for empty text', () => {
    expect(
      shouldAutoTranslate({
        sourceText: '   ',
        lastRequestedText: '',
        hasActiveConfig: true,
      }),
    ).toBe(false)
  })

  it('returns true when text changed since last request', () => {
    expect(
      shouldAutoTranslate({
        sourceText: 'hello world',
        lastRequestedText: 'hello',
        hasActiveConfig: true,
      }),
    ).toBe(true)
  })

  it('returns false when trimmed text did not change', () => {
    expect(
      shouldAutoTranslate({
        sourceText: ' hello ',
        lastRequestedText: 'hello',
        hasActiveConfig: true,
      }),
    ).toBe(false)
  })
})
