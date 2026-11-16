import { standardGeometry, type Theme } from './types'

export const minesweeper: Theme = {
  name: 'minesweeper',
  label: 'Minesweeper',
  ...standardGeometry,
  css: `.frame {
  x: 2px;
  y: 2px;
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  fill: #000;
  filter: drop-shadow(-2px -2px 0 #808080) drop-shadow(2px 2px 0 #fff);
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
  fill: #4a0000;
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(1.12);
}
.seg.on {
  fill: #ff0000;
}`,
}
