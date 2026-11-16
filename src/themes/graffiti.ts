import { standardGeometry, type Theme } from './types'

export const graffiti: Theme = {
  name: 'graffiti',
  label: 'Graffiti',
  ...standardGeometry,
  css: `.frame {
  fill: #8f3d2c;
}
.digit-bg {
  fill: none;
}
.segments {
  display: inline;
}
.seg {
  fill: #cdbba4;
  opacity: 0.75;
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(2.2, 0.25);
}
.seg-b {
  transform: translate(-6.16px, -13px) scale(0.25, 1.1);
}
.seg-c {
  transform: translateX(-6.16px) scale(0.25, 1.1);
}
.seg-e {
  transform: translate(-5.84px, 13px) scale(0.25, 1.1);
}
.seg-f {
  transform: translateX(-5.84px) scale(0.25, 1.1);
}
.digit {
  color: #ff4fb0;
}
.digit:nth-of-type(3n+2) {
  color: #ffe14a;
}
.digit:nth-of-type(3n) {
  color: #3fe0ff;
}
.digit-text {
  fill: currentColor;
  stroke: #111;
  stroke-width: 3;
  stroke-linejoin: round;
  paint-order: stroke;
  font: bold 27px 'Arial Rounded MT Bold', 'Marker Felt', 'Comic Sans MS', Arial, sans-serif;
  transform-box: fill-box;
  transform-origin: center;
  transform: rotate(-6deg);
  filter: drop-shadow(1.5px 1.5px 0 rgba(0, 0, 0, 0.6));
}
.digit:nth-of-type(even) .digit-text {
  transform: rotate(5deg);
}
.digit-shade {
  display: inline;
  fill: currentColor;
  rx: 11px;
  transform-box: fill-box;
  transform-origin: center bottom;
  transform: scale(0.08, 0.3);
}
.digit:nth-of-type(even) .digit-shade {
  transform: scale(0.08, 0.22);
}
.digit[data-value="4"] .digit-shade {
  translate: 3px 0;
}
.digit[data-value="7"] .digit-shade {
  translate: -2px 0;
}`,
}
