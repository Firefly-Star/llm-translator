import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../App'

const streamTranslationMock = vi.fn()
const runSpeedTestMock = vi.fn()

vi.mock('../lib/llm', () => ({
  streamTranslation: (...args: unknown[]) => streamTranslationMock(...args),
  runSpeedTest: (...args: unknown[]) => runSpeedTestMock(...args),
}))

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  vi.clearAllMocks()
})

beforeEach(() => {
  streamTranslationMock.mockResolvedValue(undefined)
  runSpeedTestMock.mockResolvedValue({ ok: true, latencyMs: 10, message: 'hello' })
})

describe('App', () => {
  it('renders main translator controls', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'LLM Translator' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '开始翻译' })).toBeDisabled()
    expect(screen.getByLabelText('待翻译文本')).toBeInTheDocument()
    expect(screen.getByLabelText('翻译结果')).toBeInTheDocument()
  })

  it('renders saved config selector', () => {
    render(<App />)

    expect(screen.getByLabelText('当前配置')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '默认配置' })).toBeInTheDocument()
  })

  it('renders target language selector with Chinese as default', () => {
    render(<App />)

    const languageSelect = screen.getByLabelText('目标语言') as HTMLSelectElement
    expect(languageSelect.value).toBe('zh-CN')
    expect(languageSelect.options.namedItem('de')).toBeNull()
    expect(Array.from(languageSelect.options).some((option) => option.text === '中文（简体）')).toBe(true)
    expect(Array.from(languageSelect.options).some((option) => option.text === 'Deutsch')).toBe(true)
  })

  it('renders source language selector with auto-detect as default', () => {
    render(<App />)

    const sourceLanguageSelect = screen.getByLabelText('源语言') as HTMLSelectElement
    expect(sourceLanguageSelect.value).toBe('auto')
    expect(screen.getByRole('option', { name: '自动检测' })).toBeInTheDocument()
  })

  it('disables swap button while source language is auto', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: '交换语言方向' })).toBeDisabled()
  })

  it('enables swap button after choosing an explicit source language', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('源语言'), {
      target: { value: 'en' },
    })

    expect(screen.getByRole('button', { name: '交换语言方向' })).not.toBeDisabled()
  })

  it('auto-translates again when target language changes and source text exists', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('待翻译文本'), {
      target: { value: 'hello world' },
    })

    fireEvent.click(screen.getByRole('button', { name: '开始翻译' }))
    await waitFor(() => expect(streamTranslationMock).toHaveBeenCalledTimes(1))

    fireEvent.change(screen.getByLabelText('目标语言'), {
      target: { value: 'de' },
    })

    fireEvent.click(screen.getByRole('button', { name: '开始翻译' }))
    await waitFor(() => expect(streamTranslationMock).toHaveBeenCalledTimes(2))
  })
})
