import { describe, expect, it } from 'bun:test'
import { renderCounter } from '../src/render.ts'
import { themeList, themes } from '../src/themes/index.ts'

const countMatches = (text: string, pattern: RegExp) => [...text.matchAll(pattern)].length

describe('renderCounter', () => {
  it('renders one digit group per digit', () => {
    const svg = renderCounter(1234, themes.lcd)
    expect(countMatches(svg, /class="digit"/g)).toBe(4)
    expect(svg).toContain('aria-label="1234"')
  })

  it('pads with zeros up to minDigits and grows past it', () => {
    expect(renderCounter(42, themes.lcd, { minDigits: 6 })).toContain('aria-label="000042"')
    expect(renderCounter(1234567, themes.lcd, { minDigits: 6 })).toContain('aria-label="1234567"')
  })

  it('lights the right segments', () => {
    const svg = renderCounter(1111, themes.lcd)
    expect(countMatches(svg, /class="seg seg-\w on"/g)).toBe(8)
    expect(svg).toContain('class="seg seg-b on"')
    expect(svg).toContain('class="seg seg-c on"')
  })

  it('sizes the image from the theme geometry', () => {
    const { digitWidth, digitHeight, gap, padding } = themes.lcd
    const svg = renderCounter(1234, themes.lcd)
    expect(svg).toContain(`width="${padding * 2 + digitWidth * 4 + gap * 3}"`)
    expect(svg).toContain(`height="${padding * 2 + digitHeight}"`)
  })

  it('never renders fewer than four digits', () => {
    expect(renderCounter(7, themes.lcd, { minDigits: 1 })).toContain('aria-label="0007"')
  })

  it('adds custom css after the theme css so it overrides it', () => {
    const svg = renderCounter(1, themes.lcd, { css: '.frame { fill: hotpink; }' })
    expect(svg.indexOf('hotpink')).toBeGreaterThan(svg.indexOf('#5dff7a'))
    expect(svg).toContain('#5dff7a')
  })

  it('falls back to the theme css when custom css is blank', () => {
    expect(renderCounter(1, themes.lcd, { css: '  ' })).toContain('#5dff7a')
  })

  it('escapes custom css so it cannot break out of the style element', () => {
    const svg = renderCounter(1, themes.lcd, { css: '</style><script>alert(1)</script>' })
    expect(svg).not.toContain('<script>')
    expect(svg).toContain('&lt;/style&gt;&lt;script&gt;')
  })

  it('renders every registered theme', () => {
    for (const theme of themeList) {
      expect(renderCounter(9876543210, theme)).toMatch(/^<svg .*<\/svg>$/s)
    }
  })
})
