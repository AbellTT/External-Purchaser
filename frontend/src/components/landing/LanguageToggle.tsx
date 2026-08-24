import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { changeLanguage, SUPPORTED_LANGUAGES } from '@/i18n'

/**
 * EN / አማርኛ language switcher.
 * Rendered only inside the landing page Navbar by design.
 */
export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation()
  const active = i18n.language?.startsWith('am') ? 'am' : 'en'

  return (
    <div
      className="inline-flex items-center rounded-full border border-border bg-card/60 p-0.5"
      role="group"
      aria-label="Language switcher"
    >
      {!compact && (
        <span className="pl-2 pr-1 text-muted-foreground" aria-hidden>
          <Languages className="w-3.5 h-3.5" />
        </span>
      )}
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => changeLanguage(lang.code)}
          aria-pressed={active === lang.code}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
            active === lang.code
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {lang.nativeName}
        </button>
      ))}
    </div>
  )
}