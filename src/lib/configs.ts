import type { LlmConfig } from './types'

export function createConfigDraft(seed: number): LlmConfig {
  return {
    id: `config-${seed}`,
    name: `配置 ${seed}`,
    provider: 'OpenAI-compatible',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4.1-mini',
    systemPrompt:
      'You are a translation assistant. Translate the user text faithfully and naturally. Return translation only unless the user explicitly asks otherwise.',
    temperature: 0.2,
  }
}

export function upsertConfig(configs: LlmConfig[], nextConfig: LlmConfig): LlmConfig[] {
  const index = configs.findIndex((config) => config.id === nextConfig.id)

  if (index === -1) {
    return [...configs, nextConfig]
  }

  return configs.map((config) => (config.id === nextConfig.id ? nextConfig : config))
}

export function removeConfig(configs: LlmConfig[], configId: string): LlmConfig[] {
  return configs.filter((config) => config.id !== configId)
}
