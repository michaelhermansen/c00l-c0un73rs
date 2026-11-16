import { standardGeometry, type Theme } from './types.ts'

export const lcd: Theme = {
  name: 'lcd',
  label: 'LCD',
  ...standardGeometry,
  css: `.frame { fill: #1a1f1a; }
.digit-bg { fill: #0d120d; }
.digit-text { display: none; }
.segments { display: inline; }
.seg { fill: #16301a; }
.seg.on { fill: #5dff7a; }`,
}
