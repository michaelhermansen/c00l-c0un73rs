import type { Theme } from './themes/index.ts'

export const MIN_MIN_DIGITS = 4
export const MAX_MIN_DIGITS = 12
export const DEFAULT_MIN_DIGITS = 9

const BASE_CSS = `.segments, .digit-shade { display: none; }
.digit-text { text-anchor: middle; dominant-baseline: central; }`

const SEGMENTS_BY_DIGIT: Record<string, string> = {
  '0': 'abcdef',
  '1': 'bc',
  '2': 'abged',
  '3': 'abgcd',
  '4': 'fgbc',
  '5': 'afgcd',
  '6': 'afgedc',
  '7': 'abc',
  '8': 'abcdefg',
  '9': 'abcdfg',
}

type RenderOptions = {
  css?: string
  minDigits?: number
}

export function escapeXml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function points(pairs: [number, number][]): string {
  return pairs.map(([x, y]) => `${round(x)},${round(y)}`).join(' ')
}

function segmentPolygons(width: number, height: number): Record<string, string> {
  const thickness = Math.min(width, height) * 0.14
  const half = thickness / 2
  const spacing = thickness * 0.15
  const left = width * 0.22
  const right = width - left
  const top = height * 0.14
  const middle = height / 2
  const bottom = height - top

  const horizontal = (y: number) =>
    points([
      [left + spacing, y],
      [left + spacing + half, y - half],
      [right - spacing - half, y - half],
      [right - spacing, y],
      [right - spacing - half, y + half],
      [left + spacing + half, y + half],
    ])

  const vertical = (x: number, from: number, to: number) =>
    points([
      [x, from + spacing],
      [x + half, from + spacing + half],
      [x + half, to - spacing - half],
      [x, to - spacing],
      [x - half, to - spacing - half],
      [x - half, from + spacing + half],
    ])

  return {
    a: horizontal(top),
    b: vertical(right, top, middle),
    c: vertical(right, middle, bottom),
    d: horizontal(bottom),
    e: vertical(left, middle, bottom),
    f: vertical(left, top, middle),
    g: horizontal(middle),
  }
}

function renderDigit(digit: string, x: number, y: number, theme: Theme, polygons: Record<string, string>): string {
  const { digitWidth: width, digitHeight: height } = theme
  const lit = SEGMENTS_BY_DIGIT[digit]
  const segments = Object.entries(polygons)
    .map(([name, shape]) => `<polygon class="seg seg-${name} ${lit.includes(name) ? 'on' : 'off'}" points="${shape}"/>`)
    .join('')

  return (
    `<g class="digit" data-value="${digit}" transform="translate(${x},${y})">` +
    `<rect class="digit-bg" width="${width}" height="${height}"/>` +
    `<g class="segments">${segments}</g>` +
    `<text class="digit-text" x="${width / 2}" y="${height / 2}">${digit}</text>` +
    `<rect class="digit-shade" width="${width}" height="${height}" fill="url(#shade)"/>` +
    `</g>`
  )
}

export function clampMinDigits(minDigits: number): number {
  return Math.min(MAX_MIN_DIGITS, Math.max(MIN_MIN_DIGITS, Math.trunc(minDigits)))
}

export function renderCounter(count: number, theme: Theme, options: RenderOptions = {}): string {
  const digits = String(Math.max(0, Math.trunc(count))).padStart(clampMinDigits(options.minDigits ?? MIN_MIN_DIGITS), '0')
  const { digitWidth, digitHeight, gap, padding } = theme
  const width = padding * 2 + digits.length * digitWidth + (digits.length - 1) * gap
  const height = padding * 2 + digitHeight
  const polygons = segmentPolygons(digitWidth, digitHeight)
  const css = options.css?.trim() ? `${theme.css}\n${options.css}` : theme.css

  const renderedDigits = [...digits]
    .map((digit, index) => renderDigit(digit, padding + index * (digitWidth + gap), padding, theme, polygons))
    .join('')

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="counter" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${digits}">` +
    `<defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#000" stop-opacity="0.6"/>` +
    `<stop offset="0.35" stop-color="#000" stop-opacity="0"/>` +
    `<stop offset="0.65" stop-color="#000" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="#000" stop-opacity="0.6"/>` +
    `</linearGradient></defs>` +
    `<style>${escapeXml(`${BASE_CSS}\n${css}`)}</style>` +
    `<rect class="frame" width="${width}" height="${height}"/>` +
    renderedDigits +
    `</svg>`
  )
}
