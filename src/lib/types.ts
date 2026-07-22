export type ProviderName = 'OpenAI-compatible' | 'OpenRouter' | 'Anthropic-compatible' | 'Custom'

export interface LlmConfig {
  id: string
  name: string
  provider: ProviderName
  baseUrl: string
  apiKey: string
  model: string
  systemPrompt: string
  temperature: number
}

export interface SpeedTestResult {
  ok: boolean
  latencyMs: number
  message: string
}

export interface AppStorage {
  configs: LlmConfig[]
  activeConfigId: string | null
  autoTranslateDelaySeconds: number
  sourceLanguage: string
  targetLanguage: string
  sourceText: string
  targetText: string
}

export interface ParsedStreamChunk {
  text: string
  done: boolean
}
