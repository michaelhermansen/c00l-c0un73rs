import { standardGeometry, type Theme } from './types'

export const terminal: Theme = {
  name: 'terminal',
  label: 'Terminal',
  ...standardGeometry,
  css: `.frame {
  fill: #031006;
  rx: 4px;
}
.digit-bg {
  fill: none;
}
.digit-text {
  fill: #4dff7c;
  font: 27px Menlo, Monaco, Consolas, 'Lucida Console', 'Courier New', monospace;
  filter: drop-shadow(0 0 1.5px #4dff7c) drop-shadow(0 0 5px rgba(40, 255, 100, 0.55));
}
.digit-shade {
  display: inline;
  fill: none;
  stroke: #000;
  stroke-width: 24;
  stroke-dasharray: 0 23 1 2 1 2 1 2 1 2 1 2 1 2 1 2 1 2 1 2 1 2 1 2 1 999;
  opacity: 0.35;
  transform-box: fill-box;
  transform-origin: center;
  transform: translateX(-11px) scaleY(1.28);
}`,
}
