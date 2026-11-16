import { describe, expect, it } from 'bun:test'
import { detectLang, messages, readLocale, switchLangPath } from '../src/i18n'

describe('detectLang', () => {
  it('picks norwegian for norwegian ip countries', () => {
    expect(detectLang('NO', undefined)).toBe('no')
    expect(detectLang('SJ', undefined)).toBe('no')
  })

  it('picks english for every other country, whatever the browser language', () => {
    expect(detectLang('SE', 'nb-NO,nb;q=0.9')).toBe('en')
  })

  it('follows the browser language when there is no country', () => {
    expect(detectLang(undefined, 'nb-NO,nb;q=0.9,en;q=0.8')).toBe('no')
    expect(detectLang(undefined, 'en-US,en;q=0.9,nb;q=0.8')).toBe('en')
    expect(detectLang(undefined, undefined)).toBe('en')
  })
})

describe('readLocale', () => {
  it('lets a language in the url win over the country', () => {
    expect(readLocale('https://site.test/en/edit/abc/def', 'NO', undefined)).toEqual({
      lang: 'en',
      prefix: '/en',
      path: '/edit/abc/def',
      origin: 'https://site.test',
    })
    expect(readLocale('https://site.test/no', 'US', undefined)).toMatchObject({ lang: 'no', prefix: '/no', path: '/' })
  })

  it('detects the language when the url has none', () => {
    expect(readLocale('https://site.test/edit/abc/def', 'NO', undefined)).toMatchObject({ lang: 'no', prefix: '', path: '/edit/abc/def' })
  })
})

describe('switchLangPath', () => {
  it('keeps the current page', () => {
    expect(switchLangPath(readLocale('https://site.test/', 'NO', undefined), 'en')).toBe('/en')
    expect(switchLangPath(readLocale('https://site.test/no/edit/abc/def', undefined, undefined), 'en')).toBe('/en/edit/abc/def')
  })
})

describe('messages', () => {
  it('has a non-empty norwegian text for every english one', () => {
    const texts = (value: object): string[] => Object.values(value).flatMap((entry) => (typeof entry === 'string' ? [entry] : texts(entry)))
    expect(texts(messages.no).length).toBe(texts(messages.en).length)
    expect(texts(messages.no).every((text) => text.trim() !== '')).toBe(true)
  })
})
