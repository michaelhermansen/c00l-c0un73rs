// webkit ignores css filter functions on elements inside an svg, but honours references to svg filters

type Region = { width: number; height: number }

type Primitive = { markup: string; reach: number }

const FILTER_DECLARATION = /(?<![-\w])filter\s*:\s*([^;{}]+)/g
const LENGTH = /^(-?(?:\d+\.?\d*|\.\d+))(?:px)?$/
const BLUR_SPREAD_IN_DEVIATIONS = 3

function escapeAttribute(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

function splitOutsideParentheses(text: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const character of text.trim()) {
    if (character === '(') depth++
    if (character === ')') depth--
    if (depth === 0 && /\s/.test(character)) {
      if (current) parts.push(current)
      current = ''
    } else {
      current += character
    }
  }
  if (current) parts.push(current)
  return depth === 0 ? parts : []
}

function parseLength(token: string): number | null {
  const match = LENGTH.exec(token)
  return match ? Number(match[1]) : null
}

function dropShadow(argument: string): Primitive | null {
  const tokens = splitOutsideParentheses(argument)
  const lengths = tokens.map(parseLength).filter((length) => length !== null)
  const colors = tokens.filter((token) => parseLength(token) === null)
  if (lengths.length < 2 || lengths.length > 3 || colors.length > 1) return null
  const [dx, dy, deviation = 0] = lengths
  if (deviation < 0) return null
  const color = escapeAttribute(colors[0] ?? 'currentColor')
  return {
    markup: `<feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${deviation}" flood-color="${color}"/>`,
    reach: Math.max(Math.abs(dx), Math.abs(dy)) + deviation * BLUR_SPREAD_IN_DEVIATIONS,
  }
}

function blur(argument: string): Primitive | null {
  const deviation = parseLength(argument.trim())
  if (deviation === null || deviation < 0) return null
  return {
    markup: `<feGaussianBlur stdDeviation="${deviation}"/>`,
    reach: deviation * BLUR_SPREAD_IN_DEVIATIONS,
  }
}

function parsePrimitives(value: string): Primitive[] | null {
  const functions = splitOutsideParentheses(value)
  if (functions.length === 0) return null
  const primitives: Primitive[] = []
  for (const call of functions) {
    const match = /^(drop-shadow|blur)\((.*)\)$/s.exec(call)
    if (!match) return null
    const primitive = match[1] === 'blur' ? blur(match[2]) : dropShadow(match[2])
    if (!primitive) return null
    primitives.push(primitive)
  }
  return primitives
}

export function replaceCssFilterFunctions(css: string, region: Region): { css: string; defs: string } {
  const filters: string[] = []
  const rewritten = css.replace(FILTER_DECLARATION, (declaration, value: string) => {
    const primitives = parsePrimitives(value)
    if (!primitives) return declaration
    const margin = Math.ceil(primitives.reduce((total, primitive) => total + primitive.reach, 0))
    const id = `fx-${filters.length}`
    filters.push(
      // css filter functions work in srgb, svg filters default to linear rgb
      `<filter id="${id}" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" ` +
        `x="${-margin}" y="${-margin}" width="${region.width + margin * 2}" height="${region.height + margin * 2}">` +
        primitives.map((primitive) => primitive.markup).join('') +
        `</filter>`,
    )
    const trailingSpace = /\s*$/.exec(value)?.[0] ?? ''
    return `filter: url(#${id})${trailingSpace}`
  })
  return { css: rewritten, defs: filters.join('') }
}
