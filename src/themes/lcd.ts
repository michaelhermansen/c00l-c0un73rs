import { standardGeometry, type Theme } from './types'

export const lcd: Theme = {
  name: 'lcd',
  label: 'LCD',
  ...standardGeometry,
  css: `.frame {
  fill: #8fa07a;
}
.digit-bg {
  fill: #a9ba8f;
}
.digit-text {
  display: none;
}
.segments {
  display: inline;
}
.seg {
  fill: #9dae84;
}
.seg.on {
  fill: #1f2e1c;
}`,
}
