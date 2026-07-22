import { DEFAULT_STORAGE, STORAGE_KEY } from './constants'
import type { AppStorage, LlmConfig } from './types'

function cloneDefaultStorage(): AppStorage {
  return {
    ...DEFAULT_STORAGE,
    configs: DEFAULT_STORAGE.configs.map((config) => ({ ...config })),
  }
}

function normalizeConfig(config: Partial<LlmConfig>): LlmConfig | null {
  if (!config.id || !config.name || !config.baseUrl || !config.model) {
    return null
  }

  return {
    id: config.id,
    name: config.name,
    provider: config.provider ?? 'Custom',
    baseUrl: config.baseUrl,
    apiKey: config.apiKey ?? '',
    model: config.model,
    systemPrompt: config.systemPrompt ?? DEFAULT_STORAGE.configs[0].systemPrompt,
    temperature:
      typeof config.temperature === 'number' && Number.isFinite(config.temperature)
        ? config.temperature
        : DEFAULT_STORAGE.configs[0].temperature,
  }
}

export function loadAppStorage(storage: Pick<Storage, 'getItem'>): AppStorage {
  const raw = storage.getItem(STORAGE_KEY)

  if (!raw) {
    return cloneDefaultStorage()
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppStorage>
    const configs = Array.isArray(parsed.configs)
      ? parsed.configs
          .map((config) => normalizeConfig(config))
          .filter((config): config is LlmConfig => config !== null)
      : []

    const fallback = cloneDefaultStorage()
    const safeConfigs = configs.length > 0 ? configs : fallback.configs
    const activeConfigId =
      typeof parsed.activeConfigId === 'string' && safeConfigs.some((config) => config.id === parsed.activeConfigId)
        ? parsed.activeConfigId
        : safeConfigs[0]?.id ?? null

    return {
      configs: safeConfigs,
      activeConfigId,
      autoTranslateDelaySeconds:
        typeof parsed.autoTranslateDelaySeconds === 'number' && parsed.autoTranslateDelaySeconds > 0
          ? parsed.autoTranslateDelaySeconds
          : fallback.autoTranslateDelaySeconds,
      sourceLanguage:
        typeof parsed.sourceLanguage === 'string' && parsed.sourceLanguage.trim()
          ? parsed.sourceLanguage
          : fallback.sourceLanguage,
      targetLanguage:
        typeof parsed.targetLanguage === 'string' && parsed.targetLanguage.trim()
          ? parsed.targetLanguage
          : fallback.targetLanguage,
      sourceText: typeof parsed.sourceText === 'string' ? parsed.sourceText : fallback.sourceText,
      targetText: typeof parsed.targetText === 'string' ? parsed.targetText : fallback.targetText,
    }
  } catch {
    return cloneDefaultStorage()
  }
}

export function saveAppStorage(storage: Pick<Storage, 'setItem'>, appStorage: AppStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(appStorage))
}
