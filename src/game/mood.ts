import { cashflowRatio, paydayAmount } from './finance'
import type { Phase, PlayerState } from './types'

export type MoodId =
  | 'waiting'
  | 'stressed'
  | 'worried'
  | 'neutral'
  | 'hopeful'
  | 'happy'
  | 'euphoric'

export interface MoodState {
  id: MoodId
  score: number
  label: string
  detail: string
}

/** 0–100 score from cashflow reality + situational phase. */
export function computeMood(player: PlayerState | null, phase: Phase): MoodState {
  if (!player) {
    return {
      id: 'waiting',
      score: 50,
      label: 'En espera',
      detail: 'Elige una profesión para empezar tu historia financiera.',
    }
  }

  if (phase === 'won') {
    return {
      id: 'euphoric',
      score: 100,
      label: 'Libre',
      detail: 'Tu ingreso pasivo cubre tu vida. Saliste del circuito.',
    }
  }

  const ratio = cashflowRatio(player)
  const payday = paydayAmount(player)
  const cash = player.cash

  let score = 48
  score += Math.min(40, ratio * 40)
  score += Math.max(-25, Math.min(18, payday / 80))
  score += Math.max(-30, Math.min(15, cash / 200))

  if (cash < 0) score -= 22
  if (cash < -2000) score -= 12
  if (payday < 0) score -= 10
  if (player.children >= 2) score -= 4
  if (player.assets.length >= 3) score += 6

  if (phase === 'doodad') score -= 8
  if (phase === 'deal') score += 2
  if (phase === 'market') score += 1

  score = Math.max(0, Math.min(100, Math.round(score)))

  if (score >= 90 || ratio >= 1) {
    return {
      id: 'euphoric',
      score,
      label: 'Eufórico',
      detail: 'El flujo te favorece: estás cerca o ya en la meta.',
    }
  }
  if (score >= 72) {
    return {
      id: 'happy',
      score,
      label: 'Tranquilo',
      detail: 'Buen colchón y el pasivo va creciendo.',
    }
  }
  if (score >= 58) {
    return {
      id: 'hopeful',
      score,
      label: 'Esperanzado',
      detail: 'Vas mejorando: sigue buscando activos con flujo.',
    }
  }
  if (score >= 42) {
    return {
      id: 'neutral',
      score,
      label: 'Neutro',
      detail: 'Aún dependes del sueldo. Cada deal cuenta.',
    }
  }
  if (score >= 25) {
    return {
      id: 'worried',
      score,
      label: 'Preocupado',
      detail: 'El payday aprieta o el efectivo anda justo.',
    }
  }
  return {
    id: 'stressed',
    score,
    label: 'Estresado',
    detail: 'Efectivo bajo o negativo: el flujo te está ganando.',
  }
}
