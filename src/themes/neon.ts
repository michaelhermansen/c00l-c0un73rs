import { standardGeometry, type Theme } from './types'

export const neon: Theme = {
  name: 'neon',
  label: 'Neon',
  ...standardGeometry,
  css: `.frame { fill: #12001f; }
.digit-bg { fill: none; }
.digit-text { display: none; }
.segments { display: inline; }
.seg { fill: #2a0a3a; }
.seg.on { fill: #ff6be6; filter: drop-shadow(0 0 3px #ff2bd6); }`,
}
