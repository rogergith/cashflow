import { passiveIncome, totalExpenses } from './finance'
import type { GameState } from './types'

export interface CoachHint {
  title: string
  detail: string
  tone: 'info' | 'action' | 'warn' | 'success'
}

export function getCoachHint(state: GameState): CoachHint {
  if (state.phase === 'career') {
    return {
      title: 'Paso 1 · Elige tu profesión',
      detail: 'Eso define tu salario, gastos fijos y dinero inicial. Luego solo tiras el dado.',
      tone: 'action',
    }
  }

  if (state.phase === 'won') {
    return {
      title: '¡Lo lograste!',
      detail: 'Tu ingreso pasivo ya cubre todos los gastos. Puedes jugar de nuevo con otra carrera.',
      tone: 'success',
    }
  }

  if (!state.player) {
    return { title: 'Preparando…', detail: '', tone: 'info' }
  }

  const passive = passiveIncome(state.player)
  const expenses = totalExpenses(state.player)
  const gap = Math.max(0, expenses - passive)

  if (state.phase === 'deal' && state.pendingDeal) {
    const need = state.pendingDeal.asset.downPayment
    const can = state.player.cash >= need
    return {
      title: can ? 'Decide: ¿compras esta oportunidad?' : 'Te falta efectivo para el enganche',
      detail: can
        ? `Si compra, sumas $${state.pendingDeal.asset.cashflow}/mes de ingreso pasivo. Te faltan $${gap}/mes para ganar.`
        : `Necesitas $${need}. Pide un préstamo abajo o pasa esta carta.`,
      tone: can ? 'action' : 'warn',
    }
  }

  if (state.phase === 'doodad' && state.pendingDoodad) {
    return {
      title: 'Pagaste un gasto del día a día',
      detail: `Confirma el pago de $${state.pendingDoodad.cost}. Luego sigue tirando el dado.`,
      tone: 'warn',
    }
  }

  if (state.phase === 'market' && state.pendingMarket) {
    return {
      title: 'El mercado te ofrece vender',
      detail: 'Si tienes el activo de la carta, puedes venderlo por efectivo. Si no, pulsa “No vender”.',
      tone: 'action',
    }
  }

  if (state.player.cash < 0) {
    return {
      title: 'Efectivo en negativo',
      detail: 'Pide un préstamo bancario (+$1,000) para seguir. Cuidado: sube tus gastos mensuales un 10%.',
      tone: 'warn',
    }
  }

  return {
    title: gap === 0 ? 'Ya puedes ganar en el próximo cálculo' : `Te faltan $${gap.toLocaleString('en-US')}/mes de ingreso pasivo`,
    detail:
      gap === 0
        ? 'Sigue comprando o espera el próximo payday — la meta ya está cubierta.'
        : 'Tira el dado → cae en casillas azules (oportunidad) → compra activos con flujo positivo.',
    tone: 'action',
  }
}
