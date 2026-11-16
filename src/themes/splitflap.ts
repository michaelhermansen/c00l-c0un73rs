import { standardGeometry, type Theme } from './types'

export const splitflap: Theme = {
  name: 'splitflap',
  label: 'Split-flap',
  ...standardGeometry,
  css: `.frame {
  fill: #111113;
}
.digit-bg {
  fill: #2a2a2e;
  stroke: #3d3d42;
  stroke-width: 1;
  rx: 3px;
}
.digit-text {
  fill: #f6f1e1;
  font: bold 29px 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
.digit-shade {
  display: inline;
  fill: #0a0a0b;
  transform-box: fill-box;
  transform-origin: center;
  transform: scaleY(0.045);
}`,
}
