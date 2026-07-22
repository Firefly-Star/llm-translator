export interface TargetLanguageOption {
  code: string
  label: string
  englishName: string
}

export const SOURCE_LANGUAGE_AUTO: TargetLanguageOption = {
  code: 'auto',
  label: '自动检测',
  englishName: 'Auto Detect',
}

export const TARGET_LANGUAGES: TargetLanguageOption[] = [
  { code: 'zh-CN', label: '中文（简体）', englishName: 'Chinese (Simplified)' },
  { code: 'zh-TW', label: '中文（繁體）', englishName: 'Chinese (Traditional)' },
  { code: 'en', label: 'English', englishName: 'English' },
  { code: 'ja', label: '日本語', englishName: 'Japanese' },
  { code: 'de', label: 'Deutsch', englishName: 'German' },
  { code: 'es', label: 'Español', englishName: 'Spanish' },
  { code: 'fr', label: 'Français', englishName: 'French' },
  { code: 'it', label: 'Italiano', englishName: 'Italian' },
  { code: 'pt', label: 'Português', englishName: 'Portuguese' },
  { code: 'ru', label: 'Русский', englishName: 'Russian' },
  { code: 'ko', label: '한국어', englishName: 'Korean' },
  { code: 'ar', label: 'العربية', englishName: 'Arabic' },
  { code: 'nl', label: 'Nederlands', englishName: 'Dutch' },
  { code: 'pl', label: 'Polski', englishName: 'Polish' },
  { code: 'tr', label: 'Türkçe', englishName: 'Turkish' },
  { code: 'uk', label: 'Українська', englishName: 'Ukrainian' },
  { code: 'vi', label: 'Tiếng Việt', englishName: 'Vietnamese' },
  { code: 'th', label: 'ไทย', englishName: 'Thai' },
  { code: 'id', label: 'Bahasa Indonesia', englishName: 'Indonesian' },
  { code: 'ms', label: 'Bahasa Melayu', englishName: 'Malay' },
  { code: 'hi', label: 'हिन्दी', englishName: 'Hindi' },
  { code: 'bn', label: 'বাংলা', englishName: 'Bengali' },
  { code: 'ta', label: 'தமிழ்', englishName: 'Tamil' },
  { code: 'te', label: 'తెలుగు', englishName: 'Telugu' },
  { code: 'fa', label: 'فارسی', englishName: 'Persian' },
  { code: 'he', label: 'עברית', englishName: 'Hebrew' },
  { code: 'sv', label: 'Svenska', englishName: 'Swedish' },
  { code: 'da', label: 'Dansk', englishName: 'Danish' },
  { code: 'fi', label: 'Suomi', englishName: 'Finnish' },
  { code: 'no', label: 'Norsk', englishName: 'Norwegian' },
  { code: 'cs', label: 'Čeština', englishName: 'Czech' },
  { code: 'hu', label: 'Magyar', englishName: 'Hungarian' },
  { code: 'ro', label: 'Română', englishName: 'Romanian' },
  { code: 'el', label: 'Ελληνικά', englishName: 'Greek' },
]

export function getTargetLanguageLabel(code: string): string {
  return TARGET_LANGUAGES.find((language) => language.code === code)?.label ?? code
}

export function getSourceLanguageLabel(code: string): string {
  if (code === SOURCE_LANGUAGE_AUTO.code) {
    return SOURCE_LANGUAGE_AUTO.label
  }

  return getTargetLanguageLabel(code)
}

export const SOURCE_LANGUAGES: TargetLanguageOption[] = [SOURCE_LANGUAGE_AUTO, ...TARGET_LANGUAGES]
