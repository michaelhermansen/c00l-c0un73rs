import { standardGeometry, type Theme } from './types'

export const western: Theme = {
  name: 'western',
  label: 'Western',
  ...standardGeometry,
  css: `.frame {
  fill: #3b200e;
  stroke: #d0a25a;
  stroke-width: 5;
  stroke-dasharray: 3.4 1.1;
}
.digit-bg {
  fill: #ecd6a2;
  stroke: #24120a;
  stroke-width: 1;
  rx: 1.5px;
}
.digit-text {
  fill: #3a1708;
  stroke: #3a1708;
  stroke-width: 0.7;
  font: bold 28px Rockwell, 'Rockwell Nova', 'Roboto Slab', 'Courier New', serif;
  dominant-baseline: alphabetic;
  transform: translateY(10.5px);
  filter: drop-shadow(1.3px 1.3px 0 #c2532b);
}
.digit-shade {
  display: inline;
  rx: 1.5px;
  opacity: 0.4;
}`,
}
