import type { AppStorage, LlmConfig } from './types'

export const STORAGE_KEY = 'llm-translator:app-state'

export const DEFAULT_SYSTEM_PROMPT =
  'You are a translation assistant. Translate the user text faithfully and naturally. Return translation only unless the user explicitly asks otherwise.'

export const DEFAULT_CONFIG: LlmConfig = {
  id: 'default-config',
  name: '默认配置',
  provider: 'OpenAI-compatible',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4.1-mini',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  temperature: 0.2,
}

export const DEFAULT_STORAGE: AppStorage = {
  configs: [DEFAULT_CONFIG],
  activeConfigId: DEFAULT_CONFIG.id,
  autoTranslateDelaySeconds: 2,
  sourceLanguage: 'auto',
  targetLanguage: 'zh-CN',
  sourceText: '',
  targetText: '',
}
