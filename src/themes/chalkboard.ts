import { standardGeometry, type Theme } from './types'

export const chalkboard: Theme = {
  name: 'chalkboard',
  label: 'Chalkboard',
  ...standardGeometry,
  css: `.frame {
  fill: #2c4a3b;
  stroke: #8a5a2b;
  stroke-width: 5;
}
.digit-bg {
  fill: none;
}
.segments {
  display: inline;
}
.seg {
  display: none;
}
.seg-g {
  display: inline;
  fill: #fff;
  opacity: 0.12;
  filter: blur(3px);
}
.digit-text {
  fill: #f3efe2;
  opacity: 0.92;
  font: 25px Chalkduster, 'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive;
}
.digit:nth-of-type(odd) .digit-text {
  transform: translateY(0.8px);
}`,
}
