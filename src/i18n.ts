export const LANGS = ['en', 'no'] as const

export type Lang = (typeof LANGS)[number]

export type Locale = {
  lang: Lang
  // empty when the language was detected instead of chosen in the url
  prefix: string
  path: string
  origin: string
}

export const HTML_LANG: Record<Lang, string> = { en: 'en', no: 'nb' }

export const LANG_NAMES: Record<Lang, string> = { en: 'English', no: 'Norsk' }

// svalbard and jan mayen has its own country code
const NORWEGIAN_COUNTRIES = ['NO', 'SJ']

const en = {
  homeTitle: 'Hit counter for your web site',
  homeTagline: 'Get a cool counter for your web site',
  createHeading: 'Create a new hit counter',
  createIntro: 'You get a code snippet that you can add to your web site.',
  createButton: 'Create counter',
  openHeading: 'Edit an existing counter',
  openLabel: 'Your edit link',
  openButton: 'Edit counter',
  visitors: 'Number of visitors',

  notFoundTitle: 'Not found',
  notFoundTagline: '404 not found',
  notFoundHeading: 'Nothing here',
  notFoundText: 'This page or counter does not exist. Check the link, or start over from the front page.',
  backToFront: 'Back to the front page',

  editTitle: 'Edit your counter',
  editTagline: 'Change the look of your counter',
  previewCaption: 'Counter preview',
  previewAlt: 'counter preview',
  numbers: 'Numbers',
  minDigits: 'Minimum digits',
  currentCount: 'Current count',
  theme: 'Theme',
  domainLock: 'Domain lock',
  allowedDomains: 'Allowed domains',
  allowedDomainsHint: 'The counter only works on these domains. Leave empty to allow every site.',
  customizeTheme: 'Customize theme',
  resetStyles: 'Reset styles',
  saveChanges: 'Save changes',
  yourCounter: 'Your counter',
  embedLabel: 'Paste this where you want the counter',
  editLinkLabel: 'Your secret edit link',
  editLinkWarning: 'Save the edit link. It is the only way to change this counter later, and it cannot be recovered.',

  footerPrivacy: 'No cookies or tracking. The host may log IP addresses.',
  footerTerms: 'Provided as-is. Counters unused for a year are deleted.',
  languageLabel: 'Language',

  client: {
    requestFailed: 'request failed',
    notAnEditLink: 'That does not look like an edit link.',
    noCounterFound: 'No counter found for that edit link.',
    confirmThemeChange: 'You have made custom changes. They will be overwritten. Continue?',
    confirmReset: 'You have made custom changes. They will be removed. Continue?',
    saved: 'Saved.',
    unsavedChanges: 'Unsaved changes.',
    changesRemoved: 'Custom changes removed.',
    embedAlt: 'hit counter',
  },
}

export type Messages = typeof en

const no: Messages = {
  homeTitle: 'Besøksteller for nettstedet ditt',
  homeTagline: 'Skaff en kul teller til nettstedet ditt',
  createHeading: 'Lag en ny besøksteller',
  createIntro: 'Du får en kodesnutt som du kan legge til på nettstedet ditt.',
  createButton: 'Lag teller',
  openHeading: 'Rediger en eksisterende teller',
  openLabel: 'Redigeringslenken din',
  openButton: 'Rediger teller',
  visitors: 'Antall besøkende',

  notFoundTitle: 'Ikke funnet',
  notFoundTagline: '404 ikke funnet',
  notFoundHeading: 'Ingenting her',
  notFoundText: 'Denne siden eller telleren finnes ikke. Sjekk lenken, eller start på nytt fra forsiden.',
  backToFront: 'Tilbake til forsiden',

  editTitle: 'Rediger telleren din',
  editTagline: 'Endre utseendet på telleren din',
  previewCaption: 'Forhåndsvisning av teller',
  previewAlt: 'forhåndsvisning av teller',
  numbers: 'Tall',
  minDigits: 'Minste antall sifre',
  currentCount: 'Nåværende antall',
  theme: 'Tema',
  domainLock: 'Domenelås',
  allowedDomains: 'Tillatte domener',
  allowedDomainsHint: 'Telleren virker bare på disse domenene. La feltet stå tomt for å tillate alle nettsteder.',
  customizeTheme: 'Tilpass tema',
  resetStyles: 'Tilbakestill stiler',
  saveChanges: 'Lagre endringer',
  yourCounter: 'Telleren din',
  embedLabel: 'Lim inn dette der telleren skal vises',
  editLinkLabel: 'Den hemmelige redigeringslenken din',
  editLinkWarning:
    'Ta vare på redigeringslenken. Den er den eneste måten å endre denne telleren på senere, og den kan ikke gjenopprettes.',

  footerPrivacy: 'Ingen informasjonskapsler eller sporing. Verten kan logge IP-adresser.',
  footerTerms: 'Leveres som den er. Tellere slettes etter et år uten bruk.',
  languageLabel: 'Språk',

  client: {
    requestFailed: 'forespørselen feilet',
    notAnEditLink: 'Det ser ikke ut som en redigeringslenke.',
    noCounterFound: 'Fant ingen teller for den redigeringslenken.',
    confirmThemeChange: 'Tilpasningene dine blir overskrevet hvis du bytter tema. Vil du fortsette?',
    confirmReset: 'Tilpasningene dine blir fjernet. Vil du fortsette?',
    saved: 'Lagret.',
    unsavedChanges: 'Ulagrede endringer.',
    changesRemoved: 'Tilpasningene er fjernet.',
    embedAlt: 'besøksteller',
  },
}

export const messages: Record<Lang, Messages> = { en, no }

export function isLang(value: string | undefined): value is Lang {
  return LANGS.includes(value as Lang)
}

export function detectLang(country: string | undefined, acceptLanguage: string | undefined): Lang {
  if (country) return NORWEGIAN_COUNTRIES.includes(country.toUpperCase()) ? 'no' : 'en'
  // no country header outside vercel, so local runs follow the browser language
  return /^(nb|nn|no)\b/i.test(acceptLanguage ?? '') ? 'no' : 'en'
}

export function readLocale(url: string, country: string | undefined, acceptLanguage: string | undefined): Locale {
  const { origin, pathname } = new URL(url)
  const [, first, ...rest] = pathname.split('/')
  if (isLang(first)) return { lang: first, prefix: `/${first}`, path: `/${rest.join('/')}`, origin }
  return { lang: detectLang(country, acceptLanguage), prefix: '', path: pathname, origin }
}

export function switchLangPath(locale: Locale, lang: Lang): string {
  return `/${lang}${locale.path === '/' ? '' : locale.path}`
}
