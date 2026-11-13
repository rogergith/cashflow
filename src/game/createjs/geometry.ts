export const W = 720
export const H = 720
export const PAD = 28
export const OUTER_CELL = 64
export const INNER_CELL = 52

export const CANVAS_SIZE = { width: W, height: H }

/** Fast Track — rectángulo exterior (16 casillas). */
export function outerRectCenters(count = 16): { x: number; y: number }[] {
  const cell = OUTER_CELL
  const top = PAD + cell / 2
  const left = PAD + cell / 2
  const bottom = H - PAD - cell / 2
  const right = W - PAD - cell / 2
  const spanX = right - left
  const spanY = bottom - top
  // 5 top + 3 right + 5 bottom + 3 left = 16 (esquinas solo en top/bottom)
  const edgeN = 5
  const sideN = 3
  const stepX = spanX / (edgeN - 1)

  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < edgeN; i++) pts.push({ x: left + i * stepX, y: top })
  for (let i = 1; i <= sideN; i++) {
    pts.push({ x: right, y: top + (i / (sideN + 1)) * spanY })
  }
  for (let i = 0; i < edgeN; i++) pts.push({ x: right - i * stepX, y: bottom })
  for (let i = 1; i <= sideN; i++) {
    pts.push({ x: left, y: bottom - (i / (sideN + 1)) * spanY })
  }

  if (pts.length !== count) {
    throw new Error(`outerRectCenters: expected ${count}, got ${pts.length}`)
  }
  return pts
}

/** Carrera de la rata — círculo interior. */
export function ratRaceCenters(count = 24): { x: number; y: number }[] {
  const cx = W / 2
  const cy = H / 2
  const radius = 168
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < count; i++) {
    // start at top, go clockwise
    const angle = -Math.PI / 2 + (i / count) * Math.PI * 2
    pts.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    })
  }
  return pts
}

/** @deprecated */
export function squareCenters(): { x: number; y: number }[] {
  return ratRaceCenters(24)
}

export function pathSteps(from: number, to: number, boardSize: number): number[] {
  const steps: number[] = []
  let p = from
  const guard = boardSize + 1
  for (let i = 0; i < guard; i++) {
    p = (p + 1) % boardSize
    steps.push(p)
    if (p === to) break
  }
  return steps
}
