import { describe, expect, it } from 'bun:test'
import { replaceCssFilterFunctions } from '../src/css-filters'

const region = { width: 100, height: 40 }

describe('replaceCssFilterFunctions', () => {
  it('turns a drop-shadow into an svg filter reference', () => {
    const { css, defs } = replaceCssFilterFunctions('.seg.on { filter: drop-shadow(0 0 3px #ff2bd6); }', region)
    expect(css).toBe('.seg.on { filter: url(#fx-0); }')
    expect(defs).toContain('<filter id="fx-0"')
    expect(defs).toContain('<feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#ff2bd6"/>')
  })

  it('chains several functions in order', () => {
    const { defs } = replaceCssFilterFunctions(
      '.a { filter: drop-shadow(0 0 1px #fff) drop-shadow(1px 2px 5px rgba(40, 255, 100, 0.55)) blur(4px); }',
      region,
    )
    expect(defs).toContain(
      '<feDropShadow dx="0" dy="0" stdDeviation="1" flood-color="#fff"/>' +
        '<feDropShadow dx="1" dy="2" stdDeviation="5" flood-color="rgba(40, 255, 100, 0.55)"/>' +
        '<feGaussianBlur stdDeviation="4"/>',
    )
  })

  it('accepts the color before the lengths and a missing blur radius', () => {
    const { defs } = replaceCssFilterFunctions('.a { filter: drop-shadow(#808080 -2px -2px); }', region)
    expect(defs).toContain('<feDropShadow dx="-2" dy="-2" stdDeviation="0" flood-color="#808080"/>')
  })

  it('makes the filter region large enough for the glow', () => {
    const { defs } = replaceCssFilterFunctions('.a { filter: drop-shadow(1px 0 2px red); }', region)
    expect(defs).toContain('filterUnits="userSpaceOnUse" x="-7" y="-7" width="114" height="54"')
  })

  it('gives each declaration its own filter', () => {
    const { css, defs } = replaceCssFilterFunctions('.a { filter: blur(1px); } .b { filter: blur(2px) }', region)
    expect(css).toBe('.a { filter: url(#fx-0); } .b { filter: url(#fx-1) }')
    expect(defs).toContain('id="fx-1"')
  })

  it('leaves declarations it cannot translate untouched', () => {
    for (const css of [
      '.a { filter: hue-rotate(90deg); }',
      '.a { filter: blur(1em); }',
      '.a { filter: url(#mine); }',
      '.a { filter: none; }',
      '.a { backdrop-filter: blur(2px); }',
    ]) {
      expect(replaceCssFilterFunctions(css, region)).toEqual({ css, defs: '' })
    }
  })

  it('escapes colors written into the markup', () => {
    const { defs } = replaceCssFilterFunctions('.a { filter: drop-shadow(0 0 1px "><script>); }', region)
    expect(defs).not.toContain('<script>')
  })
})
