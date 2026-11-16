import { standardGeometry, type Theme } from './types'

export const western: Theme = {
  name: 'western',
  label: 'Western',
  ...standardGeometry,
  css: `.frame {
  fill: #4a2a14;
  stroke: #24120a;
  stroke-width: 3;
}
.digit-bg {
  fill: #e6cf9b;
  stroke: #24120a;
  stroke-width: 1;
  rx: 1px;
}
.segments {
  display: inline;
}
.seg {
  display: none;
}
.seg-a, .seg-d {
  display: inline;
  fill: #3a1d0b;
  transform-box: fill-box;
  transform-origin: center;
  transform: scaleY(0.3);
}
.digit-text {
  fill: #2e1508;
  stroke: #2e1508;
  stroke-width: 0.5;
  font: bold 25px Rockwell, 'Rockwell Nova', 'Roboto Slab', 'Courier New', serif;
  dominant-baseline: alphabetic;
  transform: translateY(9.5px);
}
.digit-shade {
  display: inline;
  rx: 1px;
  opacity: 0.45;
}`,
}
