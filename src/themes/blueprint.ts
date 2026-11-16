import { standardGeometry, type Theme } from './types'

export const blueprint: Theme = {
  name: 'blueprint',
  label: 'Blueprint',
  ...standardGeometry,
  css: `.frame {
  fill: #1d4f91;
  stroke: #dbe8ff;
  stroke-width: 6;
  stroke-dasharray: 0.5 3.5;
}
.digit-bg {
  fill: none;
}
.segments {
  display: inline;
}
.seg {
  fill: #dbe8ff;
  opacity: 0.3;
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(2.2, 0.08);
}
.seg-c, .seg-e {
  display: none;
}
.seg-b {
  transform: translateX(-6.16px) scale(0.08, 3.4);
}
.seg-f {
  transform: translateX(-5.84px) scale(0.08, 3.4);
}
.digit-text {
  fill: #1d4f91;
  stroke: #fff;
  stroke-width: 0.9;
  font: bold 28px 'Helvetica Neue', Helvetica, Arial, sans-serif;
}`,
}
