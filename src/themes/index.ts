import type { Theme } from './types'
import { lcd } from './lcd'
import { odometer } from './odometer'
import { splitflap } from './splitflap'
import { terminal } from './terminal'
import { fluorescent } from './fluorescent'
import { neon } from './neon'
import { nixie } from './nixie'
import { webmaster } from './webmaster'
import { minesweeper } from './minesweeper'
import { windows95 } from './windows95'
import { blueprint } from './blueprint'
import { chalkboard } from './chalkboard'
import { western } from './western'
import { matchsticks } from './matchsticks'
import { graffiti } from './graffiti'

export type { Theme }

// hand-sorted from most conventional to most playful
export const themeList: Theme[] = [
  lcd,
  odometer,
  splitflap,
  terminal,
  fluorescent,
  neon,
  nixie,
  webmaster,
  minesweeper,
  windows95,
  blueprint,
  chalkboard,
  western,
  matchsticks,
  graffiti,
]

export const defaultTheme = lcd

export const themes: Record<string, Theme> = Object.fromEntries(
  themeList.map((theme) => [theme.name, theme]),
)
