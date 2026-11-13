import { Graphics } from '@createjs/easeljs'
import type { BoardSquare } from '../types'

export const SHORT_LABEL: Record<BoardSquare['kind'], string> = {
  start: 'Cobro',
  payday: 'Cobro',
  opportunity: 'Deal',
  doodad: 'Gasto',
  market: 'Venta',
  charity: 'Donar',
  downsized: 'Despido',
  baby: 'Hijo',
}

export function drawIcon(g: Graphics, kind: BoardSquare['kind'], s = 14): void {
  g.setStrokeStyle(2).beginStroke('#fff')

  switch (kind) {
    case 'start':
    case 'payday':
      g.drawCircle(0, 0, s)
      g.drawCircle(0, 0, s * 0.72)
      g.endStroke()
      g.beginFill('#fff')
      // dollar approximated as small rects
      g.drawRect(-1.5, -s * 0.55, 3, s * 1.1)
      g.drawRect(-s * 0.35, -s * 0.25, s * 0.7, 3)
      g.drawRect(-s * 0.35, s * 0.05, s * 0.7, 3)
      g.endFill()
      break
    case 'opportunity': {
      const w = s * 1.5
      const h = s * 1.05
      g.drawRoundRect(-w / 2, -h / 2 + 2, w, h, 3)
      g.moveTo(-w * 0.22, -h / 2 + 2)
        .lineTo(-w * 0.22, -h / 2 - 4)
        .lineTo(w * 0.22, -h / 2 - 4)
        .lineTo(w * 0.22, -h / 2 + 2)
      g.moveTo(0, -2).lineTo(0, 6)
      g.moveTo(-4, 2).lineTo(4, 2)
      g.endStroke()
      break
    }
    case 'doodad': {
      const w = s * 1.35
      const h = s * 1.45
      g.moveTo(-w / 2, -h / 2 + 4)
        .lineTo(-w / 2 + 3, h / 2)
        .lineTo(w / 2 - 3, h / 2)
        .lineTo(w / 2, -h / 2 + 4)
        .closePath()
      g.moveTo(-w * 0.28, -h / 2 + 4).quadraticCurveTo(0, -h / 2 - 6, w * 0.28, -h / 2 + 4)
      g.moveTo(-5, 2).lineTo(5, 2)
      g.endStroke()
      break
    }
    case 'market':
      g.moveTo(-s * 0.2, -s)
        .lineTo(s, -s)
        .lineTo(s, s * 0.15)
        .lineTo(0, s)
        .lineTo(-s, s * 0.15)
        .lineTo(-s, -s * 0.2)
        .closePath()
      g.endStroke()
      g.beginFill('#fff').drawCircle(s * 0.35, -s * 0.45, 2.5).endFill()
      break
    case 'charity': {
      const scale = s / 12
      g.endStroke()
      g.beginFill('#fff')
      g.moveTo(0, 4 * scale)
        .bezierCurveTo(0, 4 * scale, -12 * scale, -4 * scale, -12 * scale, -10 * scale)
        .bezierCurveTo(-12 * scale, -18 * scale, 0, -18 * scale, 0, -10 * scale)
        .bezierCurveTo(0, -18 * scale, 12 * scale, -18 * scale, 12 * scale, -10 * scale)
        .bezierCurveTo(12 * scale, -4 * scale, 0, 4 * scale, 0, 4 * scale)
        .closePath()
      g.endFill()
      break
    }
    case 'downsized':
      g.drawRoundRect(-s * 0.7, -s, s * 1.4, s * 2, 2)
      g.endStroke()
      g.beginFill('#fff').drawCircle(s * 0.25, 0, 2.2).endFill()
      g.beginStroke('#fff').setStrokeStyle(2)
      g.moveTo(-s * 0.35, -s * 0.35).lineTo(s * 0.05, s * 0.35)
      g.moveTo(s * 0.05, -s * 0.35).lineTo(-s * 0.35, s * 0.35)
      g.endStroke()
      break
    case 'baby':
      g.endStroke()
      g.beginFill('#fff')
      g.drawCircle(0, -s * 0.55, s * 0.38)
      g.moveTo(-s * 0.55, s * 0.85)
        .quadraticCurveTo(-s * 0.55, s * 0.05, 0, s * 0.05)
        .quadraticCurveTo(s * 0.55, s * 0.05, s * 0.55, s * 0.85)
        .closePath()
      g.endFill()
      break
    default:
      g.endStroke()
  }
}
