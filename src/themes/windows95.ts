import { standardGeometry, type Theme } from './types'

export const windows95: Theme = {
  name: 'windows95',
  label: 'Windows 95',
  ...standardGeometry,
  css: `.frame {
  x: 2px;
  y: 2px;
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  fill: #c0c0c0;
  filter: drop-shadow(-1px -1px 0 #fff) drop-shadow(1px 1px 0 #808080) drop-shadow(-1px -1px 0 #dfdfdf) drop-shadow(1px 1px 0 #000);
}
.digit-bg {
  fill: #fff;
  stroke: #808080;
  stroke-width: 2;
  stroke-dasharray: 22 58 36 999;
}
.digit-text {
  fill: #000;
  font: bold 24px 'MS Sans Serif', 'Microsoft Sans Serif', Tahoma, Geneva, Arial, sans-serif;
}
.digit-shade {
  display: inline;
  fill: none;
  stroke: #fff;
  stroke-width: 2;
  stroke-dasharray: 0 22 58 999;
}`,
}
