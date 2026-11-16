import type { Theme } from './types.ts'
import { lcd } from './lcd.ts'
import { odometer } from './odometer.ts'
import { webmaster } from './webmaster.ts'
import { neon } from './neon.ts'
import { nixie } from './nixie.ts'
import { splitflap } from './splitflap.ts'

export type { Theme }

export const themeList: Theme[] = [lcd, odometer, webmaster, neon, splitflap, nixie]

export const defaultTheme = lcd

export const themes: Record<string, Theme> = Object.fromEntries(
  themeList.map((theme) => [theme.name, theme]),
)
