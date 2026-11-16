import { standardGeometry, type Theme } from './types'

export const nixie: Theme = {
  name: 'nixie',
  label: 'Nixie Tube',
  ...standardGeometry,
  css: `.frame {
  fill: #0d0705;
  stroke: #3b2413;
  stroke-width: 2;
}
.digit-bg {
  fill: #1a0d07;
  stroke: #6e4a30;
  stroke-width: 0.8;
  stroke-opacity: 0.7;
  rx: 9px;
}
.segments {
  display: inline;
}
.seg {
  fill: none;
  stroke: #8a5a38;
  stroke-width: 0.35;
  opacity: 0.45;
}
.seg-g {
  fill: #ff5a00;
  stroke: none;
  opacity: 0.4;
  filter: blur(4px);
}
.digit-text {
  fill: #ffd9a6;
  stroke: #ff7a1a;
  stroke-width: 0.5;
  paint-order: stroke;
  font: 200 28px 'Helvetica Neue', Helvetica, Arial, sans-serif;
  filter: drop-shadow(0 0 1px #ffb060) drop-shadow(0 0 3px #ff6a00) drop-shadow(0 0 7px rgba(255, 60, 0, 0.6));
}
.digit-shade {
  display: inline;
  rx: 9px;
  opacity: 0.75;
}`,
}
