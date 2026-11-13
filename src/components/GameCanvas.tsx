import { useEffect, useRef } from 'react'
import { CANVAS_SIZE, drawBoard } from '../game/drawBoard'
import { passiveIncome, totalExpenses } from '../game/finance'
import type { PlayerState } from '../game/types'

interface Props {
  player: PlayerState | null
  lastRoll: number | null
}

export function GameCanvas({ player, lastRoll }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let hint: string | undefined
    if (player) {
      const gap = Math.max(0, totalExpenses(player) - passiveIncome(player))
      hint =
        gap === 0
          ? '¡Meta alcanzada!'
          : `Te faltan $${gap.toLocaleString('en-US')}/mes`
    }

    drawBoard(ctx, player, lastRoll, hint)
  }, [player, lastRoll])

  return (
    <canvas
      ref={ref}
      width={CANVAS_SIZE.width}
      height={CANVAS_SIZE.height}
      className="game-canvas"
      aria-label="Tablero Cashflow Lab"
    />
  )
}
