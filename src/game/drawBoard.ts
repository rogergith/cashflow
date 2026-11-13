import { BOARD, squareColor } from './board'
import type { PlayerState } from './types'

const W = 720
const H = 720
const PAD = 36
const CELL = 78

const SHORT_LABEL: Record<string, string> = {
  start: 'Cobro',
  payday: 'Cobro',
  opportunity: 'Deal',
  doodad: 'Gasto',
  market: 'Venta',
  charity: 'Donar',
  downsized: 'Despido',
  baby: 'Hijo',
}

/** 24 squares: 7 per side including corners (corners counted once). */
function squareCenters(): { x: number; y: number }[] {
  const inner = W - PAD * 2 - CELL
  const stepX = inner / 6
  const stepY = inner / 6
  const top = PAD + CELL / 2
  const left = PAD + CELL / 2
  const bottom = H - PAD - CELL / 2
  const right = W - PAD - CELL / 2

  const pts: { x: number; y: number }[] = []
  for (let i = 0; i <= 6; i++) pts.push({ x: left + i * stepX, y: top })
  for (let i = 1; i <= 6; i++) pts.push({ x: right, y: top + i * stepY })
  for (let i = 1; i <= 6; i++) pts.push({ x: right - i * stepX, y: bottom })
  for (let i = 1; i <= 5; i++) pts.push({ x: left, y: bottom - i * stepY })
  return pts
}

export function drawBoard(
  ctx: CanvasRenderingContext2D,
  player: PlayerState | null,
  lastRoll: number | null,
  centerHint?: string,
): void {
  const centers = squareCenters()

  ctx.clearRect(0, 0, W, H)

  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#0f172a')
  grad.addColorStop(1, '#1e293b')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
  roundRect(ctx, PAD + CELL * 0.7, PAD + CELL * 0.7, W - (PAD + CELL * 0.7) * 2, H - (PAD + CELL * 0.7) * 2, 18)
  ctx.fill()

  ctx.fillStyle = '#e2e8f0'
  ctx.font = '700 26px "Segoe UI", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('CASHFLOW LAB', W / 2, H / 2 - 58)

  ctx.font = '400 13px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText('Meta: ingreso pasivo ≥ gastos', W / 2, H / 2 - 32)

  if (centerHint) {
    ctx.fillStyle = '#fbbf24'
    ctx.font = '600 14px "Segoe UI", system-ui, sans-serif'
    wrapText(ctx, centerHint, W / 2, H / 2 - 8, 280, 18)
  }

  if (lastRoll != null) {
    ctx.font = '700 52px "Segoe UI", system-ui, sans-serif'
    ctx.fillStyle = '#38bdf8'
    ctx.fillText(String(lastRoll), W / 2, H / 2 + 58)
    ctx.font = '400 12px "Segoe UI", system-ui, sans-serif'
    ctx.fillStyle = '#64748b'
    ctx.fillText('última tirada', W / 2, H / 2 + 80)
  } else if (!player) {
    ctx.fillStyle = '#64748b'
    ctx.font = '400 13px "Segoe UI", system-ui, sans-serif'
    ctx.fillText('Elige una profesión a la derecha →', W / 2, H / 2 + 40)
  }

  BOARD.forEach((sq, i) => {
    const c = centers[i]
    if (!c) return
    const isHere = player?.position === i
    const color = squareColor(sq.kind)

    if (isHere) {
      ctx.save()
      ctx.shadowColor = '#fbbf24'
      ctx.shadowBlur = 18
      ctx.fillStyle = color
      roundRect(ctx, c.x - CELL / 2 - 2, c.y - CELL / 2 - 2, CELL - 2, CELL - 2, 12)
      ctx.fill()
      ctx.restore()
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 3
      roundRect(ctx, c.x - CELL / 2 - 2, c.y - CELL / 2 - 2, CELL - 2, CELL - 2, 12)
      ctx.stroke()
    } else {
      ctx.fillStyle = color
      roundRect(ctx, c.x - CELL / 2, c.y - CELL / 2, CELL - 6, CELL - 6, 10)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    ctx.fillStyle = '#fff'
    ctx.font = '700 12px "Segoe UI", system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(SHORT_LABEL[sq.kind] ?? sq.label, c.x, c.y + 4)
  })

  if (player) {
    const c = centers[player.position]
    if (!c) return
    ctx.beginPath()
    ctx.fillStyle = '#fbbf24'
    ctx.arc(c.x, c.y + 22, 11, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#78350f'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#78350f'
    ctx.font = '700 10px "Segoe UI", system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('TÚ', c.x, c.y + 26)
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.split(' ')
  let line = ''
  let yy = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy)
      line = word
      yy += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, yy)
}

export const CANVAS_SIZE = { width: W, height: H }
