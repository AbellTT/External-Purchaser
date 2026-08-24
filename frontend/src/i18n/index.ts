import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import am from './locales/am.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'EN', nativeName: 'English' },
  { code: 'am', label: 'አማ', nativeName: 'አማርኛ' },
] as const

export const LANG_STORAGE_KEY = 'app-language'

const storedLang = typeof window !== 'undefined' ? window.localStorage.getItem(LANG_STORAGE_KEY) : null
const initialLang = storedLang === 'am' || storedLang === 'en' ? storedLang : 'en'

// Keep <html lang> in sync so SEO/screen readers follow the active language.
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    am: { translation: am },
  },
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: {
    // React already escapes output — double-escaping would corrupt text.
    escapeValue: false,
  },
  returnObjects: true,
})

export function changeLanguage(lang: 'en' | 'am') {
  i18n.changeLanguage(lang)
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang)
  } catch {
    /* storage unavailable — language still switches for this session */
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang
  }
}

export default i18n