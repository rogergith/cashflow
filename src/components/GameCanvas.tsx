import { useEffect, useRef } from 'react'
import { BoardStage } from '../game/createjs/BoardStage'
import { CANVAS_SIZE } from '../game/createjs/geometry'
import { passiveIncome, totalExpenses } from '../game/finance'
import type { Phase, PlayerState } from '../game/types'

interface Props {
  player: PlayerState | null
  lastRoll: number | null
  phase: Phase
  onAnimatingChange?: (animating: boolean) => void
}

export function GameCanvas({ player, lastRoll, phase, onAnimatingChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<BoardStage | null>(null)
  const onAnimRef = useRef(onAnimatingChange)
  onAnimRef.current = onAnimatingChange

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const stage = new BoardStage(canvas, (value) => onAnimRef.current?.(value))
    stageRef.current = stage

    return () => {
      stage.destroy()
      stageRef.current = null
    }
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    let hint: string | undefined
    if (player) {
      const gap = Math.max(0, totalExpenses(player) - passiveIncome(player))
      hint = gap === 0 ? '¡Meta alcanzada!' : `Te faltan $${gap.toLocaleString('en-US')}/mes`
    }

    stage.sync({
      position: player?.position ?? null,
      lastRoll,
      centerHint: hint,
      phase,
      animateMove: true,
    })
  }, [player, lastRoll, phase])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE.width}
      height={CANVAS_SIZE.height}
      className="game-canvas"
      aria-label="Tablero Cashflow Lab"
    />
  )
}
