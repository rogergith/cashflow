import { Container, Shape } from '@createjs/easeljs'
import { Ease, Tween } from '@createjs/tweenjs'
import type { BoardSquare } from '../types'

export function playLandFx(
  fxLayer: Container,
  kind: BoardSquare['kind'],
  x: number,
  y: number,
): void {
  switch (kind) {
    case 'start':
    case 'payday':
    case 'cashflow_day':
      spawnCoins(fxLayer, x, y)
      break
    case 'opportunity':
      spawnBurst(fxLayer, x, y, '#7dd3fc', 8)
      break
    case 'dream':
      spawnBurst(fxLayer, x, y, '#fbbf24', 10)
      break
    case 'doodad':
      spawnFlash(fxLayer, x, y, '#fdba74')
      break
    case 'market':
      spawnBurst(fxLayer, x, y, '#c4b5fd', 6)
      break
    case 'charity':
      spawnHeartPulse(fxLayer, x, y)
      break
    case 'downsized':
      spawnFlash(fxLayer, x, y, '#fca5a5')
      break
    case 'baby':
      spawnBurst(fxLayer, x, y, '#fcd34d', 5)
      break
    default:
      break
  }
}

export function playWinFx(fxLayer: Container, cx: number, cy: number): void {
  for (let i = 0; i < 28; i++) {
    const p = new Shape()
    const color = i % 2 === 0 ? '#22c55e' : '#38bdf8'
    p.graphics.beginFill(color).drawCircle(0, 0, 3 + Math.random() * 3)
    p.x = cx
    p.y = cy
    p.alpha = 1
    fxLayer.addChild(p)
    const angle = (Math.PI * 2 * i) / 28 + Math.random() * 0.4
    const dist = 80 + Math.random() * 140
    Tween.get(p)
      .to(
        {
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          alpha: 0,
          scaleX: 0.3,
          scaleY: 0.3,
        },
        900 + Math.random() * 500,
        Ease.quadOut,
      )
      .call(() => {
        fxLayer.removeChild(p)
      })
  }
}

function spawnCoins(layer: Container, x: number, y: number): void {
  for (let i = 0; i < 7; i++) {
    const coin = new Shape()
    coin.graphics.beginFill('#fbbf24').drawCircle(0, 0, 5)
    coin.graphics.beginStroke('#f59e0b').setStrokeStyle(1.5).drawCircle(0, 0, 5)
    coin.x = x + (Math.random() - 0.5) * 20
    coin.y = y
    coin.alpha = 1
    layer.addChild(coin)
    Tween.get(coin)
      .wait(i * 40)
      .to({ y: y - 50 - Math.random() * 30, alpha: 0, scaleX: 1.3, scaleY: 1.3 }, 550, Ease.quadOut)
      .call(() => layer.removeChild(coin))
  }
}

function spawnBurst(layer: Container, x: number, y: number, color: string, count: number): void {
  for (let i = 0; i < count; i++) {
    const p = new Shape()
    p.graphics.beginFill(color).drawCircle(0, 0, 3)
    p.x = x
    p.y = y
    layer.addChild(p)
    const angle = (Math.PI * 2 * i) / count
    Tween.get(p)
      .to(
        {
          x: x + Math.cos(angle) * 36,
          y: y + Math.sin(angle) * 36,
          alpha: 0,
        },
        420,
        Ease.quadOut,
      )
      .call(() => layer.removeChild(p))
  }
}

function spawnFlash(layer: Container, x: number, y: number, color: string): void {
  const flash = new Shape()
  flash.graphics.beginFill(color).drawRoundRect(-34, -34, 68, 68, 12)
  flash.x = x
  flash.y = y
  flash.alpha = 0.55
  layer.addChild(flash)
  Tween.get(flash)
    .to({ alpha: 0, scaleX: 1.25, scaleY: 1.25 }, 320, Ease.quadOut)
    .call(() => layer.removeChild(flash))
}

function spawnHeartPulse(layer: Container, x: number, y: number): void {
  const heart = new Shape()
  const g = heart.graphics
  const scale = 1.1
  g.beginFill('#fda4af')
  g.moveTo(0, 4 * scale)
    .bezierCurveTo(0, 4 * scale, -12 * scale, -4 * scale, -12 * scale, -10 * scale)
    .bezierCurveTo(-12 * scale, -18 * scale, 0, -18 * scale, 0, -10 * scale)
    .bezierCurveTo(0, -18 * scale, 12 * scale, -18 * scale, 12 * scale, -10 * scale)
    .bezierCurveTo(12 * scale, -4 * scale, 0, 4 * scale, 0, 4 * scale)
    .closePath()
  heart.x = x
  heart.y = y
  heart.scaleX = 0.4
  heart.scaleY = 0.4
  heart.alpha = 1
  layer.addChild(heart)
  Tween.get(heart)
    .to({ scaleX: 1.6, scaleY: 1.6, alpha: 0 }, 520, Ease.quadOut)
    .call(() => layer.removeChild(heart))
}
