export const W = 720
export const H = 720
export const PAD = 36
export const CELL = 78

export const CANVAS_SIZE = { width: W, height: H }

/** 24 squares: 7 per side including corners (corners counted once). */
export function squareCenters(): { x: number; y: number }[] {
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
