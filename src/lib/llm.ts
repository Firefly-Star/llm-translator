import type { LlmConfig } from './types'
import { getSourceLanguageLabel, getTargetLanguageLabel } from './languages'

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '')
}

function buildMessages(
  config: LlmConfig,
  sourceText: string,
  targetLanguage: string,
  sourceLanguage: string,
) {
  const instruction =
    sourceLanguage === 'auto'
      ? `Detect the source language and translate the following text into ${getTargetLanguageLabel(targetLanguage)}. Return only the translation unless the user explicitly asks otherwise.`
      : `Translate the following text from ${getSourceLanguageLabel(sourceLanguage)} into ${getTargetLanguageLabel(targetLanguage)}. Return only the translation unless the user explicitly asks otherwise.`

  return [
    {
      role: 'system',
      content: config.systemPrompt,
    },
    {
      role: 'user',
      content: `${instruction}\n\n${sourceText}`,
    },
  ]
}

export function buildChatCompletionsUrl(baseUrl: string): string {
  const normalized = normalizeBaseUrl(baseUrl)
  return normalized.endsWith('/chat/completions') ? normalized : `${normalized}/chat/completions`
}

export async function runSpeedTest(config: LlmConfig): Promise<{ ok: boolean; latencyMs: number; message: string }> {
  const startedAt = performance.now()
  const response = await fetch(buildChatCompletionsUrl(config.baseUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: config.temperature,
      stream: false,
      messages: [
        {
          role: 'user',
          content: 'Reply with hello.',
        },
      ],
    }),
  })

  const latencyMs = Math.round(performance.now() - startedAt)

  if (!response.ok) {
    const errorText = await response.text()
    return {
      ok: false,
      latencyMs,
      message: errorText || `HTTP ${response.status}`,
    }
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  return {
    ok: true,
    latencyMs,
    message: payload.choices?.[0]?.message?.content?.trim() || '测速成功',
  }
}

export async function streamTranslation(params: {
  config: LlmConfig
  sourceText: string
  sourceLanguage: string
  targetLanguage: string
  signal: AbortSignal
  onChunk: (chunk: string) => void
}): Promise<void> {
  const response = await fetch(buildChatCompletionsUrl(params.config.baseUrl), {
    method: 'POST',
    signal: params.signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.config.apiKey}`,
    },
    body: JSON.stringify({
      model: params.config.model,
      temperature: params.config.temperature,
      stream: true,
      messages: buildMessages(
        params.config,
        params.sourceText,
        params.targetLanguage,
        params.sourceLanguage,
      ),
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `HTTP ${response.status}`)
  }

  if (!response.body) {
    throw new Error('响应没有可读流')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { value, done } = await reader.read()

      if (done) {
        break
      }

      params.onChunk(decoder.decode(value, { stream: true }))
    }

    const tail = decoder.decode()
    if (tail) {
      params.onChunk(tail)
    }
  } finally {
    reader.releaseLock()
  }
}
