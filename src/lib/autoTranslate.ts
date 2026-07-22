export function shouldAutoTranslate(params: {
  sourceText: string
  lastRequestedText: string
  hasActiveConfig: boolean
}): boolean {
  const normalizedSource = params.sourceText.trim()

  if (!params.hasActiveConfig) {
    return false
  }

  if (!normalizedSource) {
    return false
  }

  return normalizedSource !== params.lastRequestedText.trim()
}
