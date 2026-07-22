import { useEffect, useMemo, useRef, useState } from 'react'

import './App.css'
import { shouldAutoTranslate } from './lib/autoTranslate'
import {
  getSourceLanguageLabel,
  getTargetLanguageLabel,
  SOURCE_LANGUAGES,
  TARGET_LANGUAGES,
} from './lib/languages'
import { createConfigDraft, removeConfig, upsertConfig } from './lib/configs'
import { DEFAULT_STORAGE } from './lib/constants'
import { runSpeedTest, streamTranslation } from './lib/llm'
import { loadAppStorage, saveAppStorage } from './lib/storage'
import { parseStreamChunk } from './lib/stream'
import type { AppStorage, LlmConfig, SpeedTestResult } from './lib/types'

function getInitialStorage(): AppStorage {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_STORAGE
  }

  return loadAppStorage(window.localStorage)
}

function App() {
  const [appStorage, setAppStorage] = useState<AppStorage>(() => getInitialStorage())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [statusText, setStatusText] = useState('空闲')
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null)
  const [speedTests, setSpeedTests] = useState<Record<string, SpeedTestResult | { ok: false; latencyMs: number; message: string }>>({})

  const debounceTimerRef = useRef<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastRequestedTextRef = useRef('')
  const lastRequestSignatureRef = useRef('')
  const requestSequenceRef = useRef(0)

  const activeConfig = useMemo(
    () => appStorage.configs.find((config) => config.id === appStorage.activeConfigId) ?? null,
    [appStorage.activeConfigId, appStorage.configs],
  )

  useEffect(() => {
    if (!appStorage.sourceText.trim()) {
      return
    }

    if (lastRequestedTextRef.current === '') {
      return
    }

    scheduleAutoTranslate(appStorage.sourceText, true)
  }, [appStorage.sourceLanguage, appStorage.targetLanguage])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }

    saveAppStorage(window.localStorage, appStorage)
  }, [appStorage])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current)
      }
      abortControllerRef.current?.abort()
    }
  }, [])

  function updateStorage(updater: (current: AppStorage) => AppStorage) {
    setAppStorage((current) => updater(current))
  }

  function updateConfig(configId: string, field: keyof LlmConfig, value: string) {
    updateStorage((current) => ({
      ...current,
      configs: current.configs.map((config) => {
        if (config.id !== configId) {
          return config
        }

        if (field === 'temperature') {
          const numeric = Number(value)
          return {
            ...config,
            temperature: Number.isFinite(numeric) ? numeric : config.temperature,
          }
        }

        return {
          ...config,
          [field]: value,
        }
      }),
    }))
  }

  async function performTranslation(textSnapshot: string) {
    const requestSignature = `${appStorage.sourceLanguage}=>${appStorage.targetLanguage}::${textSnapshot.trim()}`

    if (!activeConfig) {
      setStatusText('请先配置模型')
      return
    }

    abortControllerRef.current?.abort()
    const abortController = new AbortController()
    abortControllerRef.current = abortController
    const requestId = ++requestSequenceRef.current
    lastRequestedTextRef.current = textSnapshot.trim()
    lastRequestSignatureRef.current = requestSignature

    setIsTranslating(true)
    setStatusText('翻译中…')
    updateStorage((current) => ({
      ...current,
      targetText: '',
    }))

    try {
      await streamTranslation({
        config: activeConfig,
        sourceText: textSnapshot,
        sourceLanguage: appStorage.sourceLanguage,
        targetLanguage: appStorage.targetLanguage,
        signal: abortController.signal,
        onChunk: (rawChunk) => {
          if (requestId !== requestSequenceRef.current) {
            return
          }

          const parsed = parseStreamChunk(rawChunk)
          if (parsed.length === 0) {
            return
          }

          const textToAppend = parsed.map((chunk) => chunk.text).join('')
          if (!textToAppend) {
            return
          }

          setAppStorage((current) => ({
            ...current,
            targetText: current.targetText + textToAppend,
          }))
        },
      })

      if (requestId === requestSequenceRef.current) {
        setStatusText('翻译完成')
      }
    } catch (error) {
      if (abortController.signal.aborted) {
        setStatusText('已取消，等待新的输入')
        return
      }

      const message = error instanceof Error ? error.message : '翻译失败'
      setStatusText(`翻译失败：${message}`)
      updateStorage((current) => ({
        ...current,
        targetText: message,
      }))
    } finally {
      if (requestId === requestSequenceRef.current) {
        setIsTranslating(false)
      }
    }
  }

  function scheduleAutoTranslate(nextText: string, force = false) {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current)
    }

    if (!nextText.trim()) {
      abortControllerRef.current?.abort()
      setIsTranslating(false)
      setStatusText('空闲')
      lastRequestedTextRef.current = ''
      lastRequestSignatureRef.current = ''
      updateStorage((current) => ({
        ...current,
        targetText: '',
      }))
      return
    }

    debounceTimerRef.current = window.setTimeout(() => {
      const nextSignature = `${appStorage.sourceLanguage}=>${appStorage.targetLanguage}::${nextText.trim()}`
      const shouldRun =
        force
          ? nextSignature !== lastRequestSignatureRef.current
          : shouldAutoTranslate({
              sourceText: nextText,
              lastRequestedText: lastRequestedTextRef.current,
              hasActiveConfig: activeConfig !== null,
            })

      if (!shouldRun) {
        return
      }

      void performTranslation(nextText)
    }, Math.max(0.3, appStorage.autoTranslateDelaySeconds) * 1000)
  }

  function handleSourceTextChange(nextText: string) {
    updateStorage((current) => ({
      ...current,
      sourceText: nextText,
    }))
    scheduleAutoTranslate(nextText)
  }

  function handleLanguageSelectionChange(field: 'sourceLanguage' | 'targetLanguage', value: string) {
    updateStorage((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleDelayChange(value: string) {
    const numeric = Number(value)
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return
    }

    updateStorage((current) => ({
      ...current,
      autoTranslateDelaySeconds: numeric,
    }))
  }

  function handleSwapLanguages() {
    if (appStorage.sourceLanguage === 'auto') {
      return
    }

    abortControllerRef.current?.abort()
    lastRequestedTextRef.current = ''
    lastRequestSignatureRef.current = ''
    setIsTranslating(false)
    setStatusText('空闲')

    updateStorage((current) => ({
      ...current,
      sourceLanguage: current.targetLanguage,
      targetLanguage: current.sourceLanguage,
      sourceText: current.targetText,
      targetText: current.sourceText,
    }))
  }

  function handleConfigAdd() {
    const draft = createConfigDraft(appStorage.configs.length + 1)
    updateStorage((current) => ({
      ...current,
      configs: [...current.configs, draft],
      activeConfigId: draft.id,
    }))
    setEditingConfigId(draft.id)
    setIsSettingsOpen(true)
  }

  function handleConfigDelete(configId: string) {
    updateStorage((current) => {
      const nextConfigs = removeConfig(current.configs, configId)
      return {
        ...current,
        configs: nextConfigs.length > 0 ? nextConfigs : [createConfigDraft(1)],
        activeConfigId:
          current.activeConfigId === configId
            ? nextConfigs[0]?.id ?? createConfigDraft(1).id
            : current.activeConfigId,
      }
    })
  }

  async function handleSpeedTest(config: LlmConfig) {
    setSpeedTests((current) => ({
      ...current,
      [config.id]: { ok: false, latencyMs: 0, message: '测速中…' },
    }))

    try {
      const result = await runSpeedTest(config)
      setSpeedTests((current) => ({
        ...current,
        [config.id]: result,
      }))
    } catch (error) {
      setSpeedTests((current) => ({
        ...current,
        [config.id]: {
          ok: false,
          latencyMs: 0,
          message: error instanceof Error ? error.message : '测速失败',
        },
      }))
    }
  }

  function handleConfigBlur(config: LlmConfig) {
    updateStorage((current) => ({
      ...current,
      configs: upsertConfig(current.configs, config),
    }))
  }

  const canTranslate = Boolean(activeConfig && appStorage.sourceText.trim() && !isTranslating)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">本地 LLM 翻译工具</p>
          <h1>LLM Translator</h1>
        </div>
        <div className="status-chip" data-busy={isTranslating}>
          {statusText}
        </div>
      </header>

      <section className="language-bar" aria-label="语言方向设置">
        <label className="field compact-field">
          <span>源语言</span>
          <select
            aria-label="源语言"
            value={appStorage.sourceLanguage}
            onChange={(event) => handleLanguageSelectionChange('sourceLanguage', event.target.value)}
          >
            {SOURCE_LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="swap-button"
          aria-label="交换语言方向"
          title={
            appStorage.sourceLanguage === 'auto'
              ? '源语言为自动检测时，无法交换语言方向'
              : '交换源语言与目标语言'
          }
          disabled={appStorage.sourceLanguage === 'auto'}
          onClick={handleSwapLanguages}
        >
          ⇄
        </button>

        <label className="field compact-field">
          <span>目标语言</span>
          <select
            aria-label="目标语言"
            value={appStorage.targetLanguage}
            onChange={(event) => handleLanguageSelectionChange('targetLanguage', event.target.value)}
          >
            {TARGET_LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="toolbar" aria-label="翻译控制区">
        <label className="field compact-field">
          <span>当前配置</span>
          <select
            aria-label="当前配置"
            value={appStorage.activeConfigId ?? ''}
            onChange={(event) =>
              updateStorage((current) => ({
                ...current,
                activeConfigId: event.target.value,
              }))
            }
          >
            {appStorage.configs.map((config) => (
              <option key={config.id} value={config.id}>
                {config.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field compact-field small-field">
          <span>自动触发延迟（秒）</span>
          <input
            aria-label="自动触发延迟（秒）"
            type="number"
            min="0.3"
            step="0.1"
            value={appStorage.autoTranslateDelaySeconds}
            onChange={(event) => handleDelayChange(event.target.value)}
          />
        </label>

        <div className="toolbar-actions">
          <button type="button" onClick={() => setIsSettingsOpen((current) => !current)}>
            {isSettingsOpen ? '收起配置' : '配置管理'}
          </button>
          <button
            type="button"
            className="primary"
            disabled={!canTranslate}
            onClick={() => void performTranslation(appStorage.sourceText)}
          >
            开始翻译
          </button>
        </div>
      </section>

      {isSettingsOpen ? (
        <section className="settings-panel" aria-label="配置管理面板">
          <div className="settings-header">
            <div>
              <h2>配置管理</h2>
              <p>配置会保存在浏览器本地，可切换、编辑和测速。</p>
            </div>
            <button type="button" onClick={handleConfigAdd}>
              新增配置
            </button>
          </div>

          <div className="config-list">
            {appStorage.configs.map((config) => {
              const testResult = speedTests[config.id]
              const isEditing = editingConfigId === config.id

              return (
                <article key={config.id} className="config-card">
                  <div className="config-card-header">
                    <button
                      type="button"
                      className={config.id === appStorage.activeConfigId ? 'link-button active' : 'link-button'}
                      onClick={() =>
                        updateStorage((current) => ({
                          ...current,
                          activeConfigId: config.id,
                        }))
                      }
                    >
                      {config.name}
                    </button>
                    <div className="config-card-actions">
                      <button type="button" onClick={() => setEditingConfigId(isEditing ? null : config.id)}>
                        {isEditing ? '收起编辑' : '编辑'}
                      </button>
                      <button type="button" onClick={() => void handleSpeedTest(config)}>
                        测速
                      </button>
                      <button
                        type="button"
                        disabled={appStorage.configs.length <= 1}
                        onClick={() => handleConfigDelete(config.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>

                  <p className="config-meta">
                    {config.provider} · {config.model}
                  </p>
                  {testResult ? (
                    <p className={testResult.ok ? 'test-result ok' : 'test-result'}>
                      {testResult.message}
                      {testResult.latencyMs > 0 ? ` · ${testResult.latencyMs}ms` : ''}
                    </p>
                  ) : null}

                  {isEditing ? (
                    <div className="config-form">
                      <label className="field">
                        <span>名称</span>
                        <input
                          value={config.name}
                          onChange={(event) => updateConfig(config.id, 'name', event.target.value)}
                          onBlur={() => handleConfigBlur(config)}
                        />
                      </label>
                      <label className="field">
                        <span>Provider</span>
                        <input
                          value={config.provider}
                          onChange={(event) => updateConfig(config.id, 'provider', event.target.value)}
                          onBlur={() => handleConfigBlur(config)}
                        />
                      </label>
                      <label className="field">
                        <span>Base URL</span>
                        <input
                          value={config.baseUrl}
                          onChange={(event) => updateConfig(config.id, 'baseUrl', event.target.value)}
                          onBlur={() => handleConfigBlur(config)}
                        />
                      </label>
                      <label className="field">
                        <span>API Key</span>
                        <input
                          type="password"
                          value={config.apiKey}
                          onChange={(event) => updateConfig(config.id, 'apiKey', event.target.value)}
                          onBlur={() => handleConfigBlur(config)}
                        />
                      </label>
                      <label className="field">
                        <span>Model</span>
                        <input
                          value={config.model}
                          onChange={(event) => updateConfig(config.id, 'model', event.target.value)}
                          onBlur={() => handleConfigBlur(config)}
                        />
                      </label>
                      <label className="field">
                        <span>Temperature</span>
                        <input
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          value={config.temperature}
                          onChange={(event) => updateConfig(config.id, 'temperature', event.target.value)}
                          onBlur={() => handleConfigBlur(config)}
                        />
                      </label>
                      <label className="field full-width">
                        <span>System Prompt</span>
                        <textarea
                          rows={4}
                          value={config.systemPrompt}
                          onChange={(event) => updateConfig(config.id, 'systemPrompt', event.target.value)}
                          onBlur={() => handleConfigBlur(config)}
                        />
                      </label>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>
      ) : null}

      <main className="workspace">
        <section className="panel">
          <div className="panel-header">
            <h2>输入</h2>
            <span>
              {appStorage.sourceLanguage === 'auto'
                ? '源语言：自动检测'
                : `源语言：${getSourceLanguageLabel(appStorage.sourceLanguage)}`}
            </span>
          </div>
          <label className="sr-only" htmlFor="source-text">
            待翻译文本
          </label>
          <textarea
            id="source-text"
            aria-label="待翻译文本"
            className="editor"
            placeholder="在这里输入需要翻译的文本……"
            value={appStorage.sourceText}
            onChange={(event) => handleSourceTextChange(event.target.value)}
          />
        </section>

        <section className="panel output-panel">
          <div className="panel-header">
            <h2>输出</h2>
            <span>
              {isTranslating ? `流式输出中 · ${getTargetLanguageLabel(appStorage.targetLanguage)}` : `目标语言：${getTargetLanguageLabel(appStorage.targetLanguage)}`}
            </span>
          </div>
          <label className="sr-only" htmlFor="target-text">
            翻译结果
          </label>
          <textarea
            id="target-text"
            aria-label="翻译结果"
            className="editor output"
            value={appStorage.targetText}
            placeholder="翻译结果会在这里显示……"
            readOnly
          />
        </section>
      </main>
    </div>
  )
}

export default App
