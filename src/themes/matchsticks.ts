import { standardGeometry, type Theme } from './types'

export const matchsticks: Theme = {
  name: 'matchsticks',
  label: 'Matchsticks',
  ...standardGeometry,
  css: `.frame {
  fill: #2a2420;
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
.seg.off {
  display: none;
}
.seg {
  fill: #ecd29c;
  stroke: #c8102e;
  stroke-width: 2.2;
  stroke-linejoin: round;
  stroke-linecap: round;
  transform-box: fill-box;
  transform-origin: center;
  filter: drop-shadow(0.5px 0.8px 0 rgba(0, 0, 0, 0.55));
}
.seg-a, .seg-d, .seg-g {
  transform: scale(1.08, 0.5);
  stroke-dasharray: 1.2 22.94 1.2;
}
.seg-a {
  stroke-dasharray: 2.4 99;
  stroke-dashoffset: -11.47;
}
.seg-b, .seg-c, .seg-e, .seg-f {
  transform: scale(0.5, 1.06);
  stroke-dasharray: 1.2 24.22 1.2;
}
.seg-b, .seg-c {
  stroke-dasharray: 2.4 99;
  stroke-dashoffset: -12.11;
}`,
}
