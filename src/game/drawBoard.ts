import { BOARD, squareColor } from './board'
import type { BoardSquare, PlayerState } from './types'

const W = 720
const H = 720
const PAD = 36
const CELL = 78

const SHORT_LABEL: Record<BoardSquare['kind'], string> = {
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

    drawSquareIcon(ctx, sq.kind, c.x, c.y - 10, 14)

    ctx.fillStyle = '#fff'
    ctx.font = '700 11px "Segoe UI", system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(SHORT_LABEL[sq.kind], c.x, c.y + 18)
    ctx.textBaseline = 'alphabetic'
  })

  if (player) {
    const c = centers[player.position]
    if (!c) return
    ctx.beginPath()
    ctx.fillStyle = '#fbbf24'
    ctx.arc(c.x + 22, c.y - 22, 11, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#78350f'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#78350f'
    ctx.font = '700 9px "Segoe UI", system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('TÚ', c.x + 22, c.y - 21)
    ctx.textBaseline = 'alphabetic'
  }
}

function drawSquareIcon(
  ctx: CanvasRenderingContext2D,
  kind: BoardSquare['kind'],
  x: number,
  y: number,
  s: number,
): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.strokeStyle = '#fff'
  ctx.fillStyle = '#fff'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (kind) {
    case 'start':
    case 'payday':
      drawCoinIcon(ctx, s)
      break
    case 'opportunity':
      drawDealIcon(ctx, s)
      break
    case 'doodad':
      drawSpendIcon(ctx, s)
      break
    case 'market':
      drawMarketIcon(ctx, s)
      break
    case 'charity':
      drawHeartIcon(ctx, s)
      break
    case 'downsized':
      drawFiredIcon(ctx, s)
      break
    case 'baby':
      drawChildIcon(ctx, s)
      break
    default:
      break
  }

  ctx.restore()
}

/** Moneda / cobro */
function drawCoinIcon(ctx: CanvasRenderingContext2D, s: number): void {
  ctx.beginPath()
  ctx.arc(0, 0, s, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, s * 0.72, 0, Math.PI * 2)
  ctx.stroke()
  ctx.font = `700 ${Math.round(s * 1.1)}px "Segoe UI", system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('$', 0, 1)
}

/** Maletín + flecha arriba = oportunidad de inversión */
function drawDealIcon(ctx: CanvasRenderingContext2D, s: number): void {
  const w = s * 1.5
  const h = s * 1.05
  roundRect(ctx, -w / 2, -h / 2 + 2, w, h, 3)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-w * 0.22, -h / 2 + 2)
  ctx.lineTo(-w * 0.22, -h / 2 - 4)
  ctx.lineTo(w * 0.22, -h / 2 - 4)
  ctx.lineTo(w * 0.22, -h / 2 + 2)
  ctx.stroke()
  // plus
  ctx.beginPath()
  ctx.moveTo(0, -2)
  ctx.lineTo(0, 6)
  ctx.moveTo(-4, 2)
  ctx.lineTo(4, 2)
  ctx.stroke()
}

/** Bolsa / ticket con signo − */
function drawSpendIcon(ctx: CanvasRenderingContext2D, s: number): void {
  const w = s * 1.35
  const h = s * 1.45
  ctx.beginPath()
  ctx.moveTo(-w / 2, -h / 2 + 4)
  ctx.lineTo(-w / 2 + 3, h / 2)
  ctx.lineTo(w / 2 - 3, h / 2)
  ctx.lineTo(w / 2, -h / 2 + 4)
  ctx.closePath()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-w * 0.28, -h / 2 + 4)
  ctx.quadraticCurveTo(0, -h / 2 - 6, w * 0.28, -h / 2 + 4)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-5, 2)
  ctx.lineTo(5, 2)
  ctx.stroke()
}

/** Etiqueta de precio / venta */
function drawMarketIcon(ctx: CanvasRenderingContext2D, s: number): void {
  ctx.beginPath()
  ctx.moveTo(-s * 0.2, -s)
  ctx.lineTo(s, -s)
  ctx.lineTo(s, s * 0.15)
  ctx.lineTo(0, s)
  ctx.lineTo(-s, s * 0.15)
  ctx.lineTo(-s, -s * 0.2)
  ctx.closePath()
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(s * 0.35, -s * 0.45, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.font = `700 ${Math.round(s * 0.9)}px "Segoe UI", system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('$', -2, 2)
}

/** Corazón = donar */
function drawHeartIcon(ctx: CanvasRenderingContext2D, s: number): void {
  const scale = s / 12
  ctx.beginPath()
  ctx.moveTo(0, 4 * scale)
  ctx.bezierCurveTo(0, 4 * scale, -12 * scale, -4 * scale, -12 * scale, -10 * scale)
  ctx.bezierCurveTo(-12 * scale, -18 * scale, 0, -18 * scale, 0, -10 * scale)
  ctx.bezierCurveTo(0, -18 * scale, 12 * scale, -18 * scale, 12 * scale, -10 * scale)
  ctx.bezierCurveTo(12 * scale, -4 * scale, 0, 4 * scale, 0, 4 * scale)
  ctx.closePath()
  ctx.fill()
}

/** Puerta / X = despido */
function drawFiredIcon(ctx: CanvasRenderingContext2D, s: number): void {
  roundRect(ctx, -s * 0.7, -s, s * 1.4, s * 2, 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(s * 0.25, 0, 2.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-s * 0.35, -s * 0.35)
  ctx.lineTo(s * 0.05, s * 0.35)
  ctx.moveTo(s * 0.05, -s * 0.35)
  ctx.lineTo(-s * 0.35, s * 0.35)
  ctx.stroke()
}

/** Silueta de niño */
function drawChildIcon(ctx: CanvasRenderingContext2D, s: number): void {
  ctx.beginPath()
  ctx.arc(0, -s * 0.55, s * 0.38, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-s * 0.55, s * 0.85)
  ctx.quadraticCurveTo(-s * 0.55, s * 0.05, 0, s * 0.05)
  ctx.quadraticCurveTo(s * 0.55, s * 0.05, s * 0.55, s * 0.85)
  ctx.closePath()
  ctx.fill()
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
