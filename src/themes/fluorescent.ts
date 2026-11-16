import { standardGeometry, type Theme } from './types'

export const fluorescent: Theme = {
  name: 'fluorescent',
  label: 'Fluorescent',
  ...standardGeometry,
  css: `.frame {
  fill: #1b1f26;
}
.digit-bg {
  fill: none;
}
.digit-text {
  display: none;
}
.segments {
  display: inline;
}
.seg {
  fill: #2d333d;
  stroke: #2d333d;
  stroke-width: 1.2;
  stroke-linejoin: round;
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(1, 0.5);
}
.seg-b, .seg-c, .seg-e, .seg-f {
  transform: scale(0.5, 1);
}
.seg.on {
  fill: #f6fcff;
  stroke: #f6fcff;
  filter: drop-shadow(0 0 1.2px #cfeaff) drop-shadow(0 0 4px rgba(120, 190, 255, 0.75));
}`,
}
