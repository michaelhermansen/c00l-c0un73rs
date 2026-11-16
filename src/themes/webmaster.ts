import { standardGeometry, type Theme } from './types.ts'

export const webmaster: Theme = {
  name: 'webmaster',
  label: 'Webmaster 99',
  ...standardGeometry,
  css: `.frame { fill: #c0c0c0; stroke: #808080; stroke-width: 2; }
.digit-bg { fill: #000; }
.digit-text { fill: #0f0; font: bold 28px 'Courier New', Courier, monospace; }`,
}
