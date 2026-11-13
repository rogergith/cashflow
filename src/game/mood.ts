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
      detail: 'El traje listo. Elige profesión y empieza el circuito.',
    }
  }

  if (phase === 'won') {
    return {
      id: 'euphoric',
      score: 100,
      label: 'Libre',
      detail: 'Traje de victoria: lograste tu sueño.',
    }
  }

  if (player.track === 'fast_track') {
    const need = Math.max(0, player.dream.cost - player.cash)
    return {
      id: need === 0 ? 'euphoric' : 'happy',
      score: need === 0 ? 95 : 78,
      label: need === 0 ? 'Listo para el sueño' : 'En el Fast Track',
      detail:
        need === 0
          ? `Puedes comprar: ${player.dream.title}.`
          : `Persiguiendo ${player.dream.title}. Faltan $${need}.`,
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

  // Situaciones que se avecinan / están encima
  if (phase === 'doodad') score -= 10
  if (phase === 'deal') score += 4
  if (phase === 'market') score += 2

  score = Math.max(0, Math.min(100, Math.round(score)))

  const situation =
    phase === 'doodad'
      ? 'Se avecina un gasto: el traje se tensa.'
      : phase === 'deal'
        ? 'Oportunidad delante: el traje se afila.'
        : phase === 'market'
          ? 'Mercado abierto: ¿vendes o aguantas?'
          : null

  if (score >= 90 || ratio >= 1) {
    return {
      id: 'euphoric',
      score,
      label: 'Eufórico',
      detail: situation ?? 'Traje premium: el flujo te sonríe.',
    }
  }
  if (score >= 72) {
    return {
      id: 'happy',
      score,
      label: 'Tranquilo',
      detail: situation ?? 'Traje en orden y buen colchón.',
    }
  }
  if (score >= 58) {
    return {
      id: 'hopeful',
      score,
      label: 'Esperanzado',
      detail: situation ?? 'El traje apunta a más activos.',
    }
  }
  if (score >= 42) {
    return {
      id: 'neutral',
      score,
      label: 'Neutro',
      detail: situation ?? 'Traje de oficina: aún vives del sueldo.',
    }
  }
  if (score >= 25) {
    return {
      id: 'worried',
      score,
      label: 'Preocupado',
      detail: situation ?? 'El traje se arruga: el payday aprieta.',
    }
  }
  return {
    id: 'stressed',
    score,
    label: 'Estresado',
    detail: situation ?? 'Traje al límite: el efectivo no alcanza.',
  }
}
