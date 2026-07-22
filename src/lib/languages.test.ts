import { describe, expect, it } from 'vitest'

import { getTargetLanguageLabel, TARGET_LANGUAGES } from './languages'

describe('languages', () => {
  it('defaults language list to simplified Chinese first', () => {
    expect(TARGET_LANGUAGES[0]).toMatchObject({
      code: 'zh-CN',
      label: '中文（简体）',
    })
  })

  it('contains common target languages', () => {
    expect(TARGET_LANGUAGES.map((item) => item.code)).toEqual(
      expect.arrayContaining(['en', 'ja', 'de', 'es', 'fr', 'ru']),
    )
  })

  it('resolves label from code', () => {
    expect(getTargetLanguageLabel('de')).toBe('Deutsch')
  })

  it('falls back to code when label is unknown', () => {
    expect(getTargetLanguageLabel('xx')).toBe('xx')
  })
})
