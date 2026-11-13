import { useEffect, useRef } from 'react'
import { BoardStage } from '../game/createjs/BoardStage'
import { CANVAS_SIZE } from '../game/createjs/geometry'
import { passiveIncome, totalExpenses } from '../game/finance'
import { computeMood } from '../game/mood'
import type { Phase, PlayerState, Track } from '../game/types'

interface Props {
  player: PlayerState | null
  lastRoll: number | null
  phase: Phase
  justEscaped?: boolean
  onAnimatingChange?: (animating: boolean) => void
}

export function GameCanvas({ player, lastRoll, phase, justEscaped = false, onAnimatingChange }: Props) {
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

    const track: Track = player?.track ?? 'rat_race'
    let hint: string | undefined
    if (player) {
      if (track === 'fast_track') {
        const need = Math.max(0, player.dream.cost - player.cash)
        hint = need === 0 ? `Puedes comprar: ${player.dream.title}` : `Sueño: faltan $${need.toLocaleString('en-US')}`
      } else {
        const gap = Math.max(0, totalExpenses(player) - passiveIncome(player))
        hint = gap === 0 ? '¡Listo para salir de la rata!' : `Rata: faltan $${gap.toLocaleString('en-US')}/mes`
      }
    }

    stage.sync({
      position: player?.position ?? null,
      lastRoll,
      centerHint: hint,
      phase,
      mood: computeMood(player, phase),
      track,
      animateMove: true,
      justEscaped,
    })
  }, [player, lastRoll, phase, justEscaped])

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
