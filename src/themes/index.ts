import type { Theme } from './types'
import { lcd } from './lcd'
import { odometer } from './odometer'
import { webmaster } from './webmaster'
import { neon } from './neon'
import { nixie } from './nixie'
import { splitflap } from './splitflap'

export type { Theme }

export const themeList: Theme[] = [lcd, odometer, webmaster, neon, splitflap, nixie]

export const defaultTheme = lcd

export const themes: Record<string, Theme> = Object.fromEntries(
  themeList.map((theme) => [theme.name, theme]),
)
