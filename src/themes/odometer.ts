import { standardGeometry, type Theme } from './types'

export const odometer: Theme = {
  name: 'odometer',
  label: 'Odometer',
  ...standardGeometry,
  css: `.frame {
  fill: #2b2b2b;
}
.digit-bg {
  fill: #111;
  stroke: #444;
  stroke-width: 1;
}
.digit-text {
  fill: #f4f1e6;
  font: bold 28px Georgia, 'Times New Roman', serif;
}
.digit-shade {
  display: inline;
}`,
}
