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
      detail: 'Entrarás a la Carrera de la Rata. Meta: ingreso pasivo ≥ gastos para salir al Fast Track.',
      tone: 'action',
    }
  }

  if (state.phase === 'won') {
    return {
      title: '¡Sueño cumplido!',
      detail: 'Saliste de la rata y compraste tu sueño en el Fast Track. Juega de nuevo si quieres.',
      tone: 'success',
    }
  }

  if (!state.player) {
    return { title: 'Preparando…', detail: '', tone: 'info' }
  }

  const passive = passiveIncome(state.player)
  const expenses = totalExpenses(state.player)
  const gap = Math.max(0, expenses - passive)
  const onFast = state.player.track === 'fast_track'

  if (state.justEscaped || (state.phase === 'end_turn' && onFast && state.turn > 0 && gap === 0 && state.log[0]?.text.includes('Saliste'))) {
    return {
      title: 'Escapaste de la Carrera de la Rata',
      detail: `Ahora persigue tu sueño: ${state.player.dream.title} ($${state.player.dream.cost}). Cierra el turno y sigue.`,
      tone: 'success',
    }
  }

  if (state.phase === 'end_turn') {
    return {
      title: 'Fin de turno',
      detail: 'Revisa tu dinero. Puedes pedir o pagar un préstamo, luego pulsa “Terminar turno”.',
      tone: 'action',
    }
  }

  if (state.phase === 'deal' && state.pendingDeal) {
    const need = state.pendingDeal.asset.downPayment
    const can = state.player.cash >= need
    return {
      title: can ? '¿Compras esta oportunidad?' : 'Te falta efectivo para el enganche',
      detail: can
        ? onFast
          ? `Gran deal: +$${state.pendingDeal.asset.cashflow}/mes. Tu sueño cuesta $${state.player.dream.cost}.`
          : `+$${state.pendingDeal.asset.cashflow}/mes de pasivo. Te faltan $${gap}/mes para salir de la rata.`
        : `Necesitas $${need}. Pide un préstamo o pasa.`,
      tone: can ? 'action' : 'warn',
    }
  }

  if (state.phase === 'doodad' && state.pendingDoodad) {
    return {
      title: onFast ? 'Gasto de lujo' : 'Gasto del día a día',
      detail: `Confirma el pago de $${state.pendingDoodad.cost}.`,
      tone: 'warn',
    }
  }

  if (state.phase === 'market' && state.pendingMarket) {
    return {
      title: 'Mercado',
      detail: 'Vende si tienes el activo de la carta; si no, “No vender”.',
      tone: 'action',
    }
  }

  if (state.player.cash < 0) {
    return {
      title: 'Efectivo en negativo',
      detail: 'Pide un préstamo (+$1,000). Te cuesta +$100/mes.',
      tone: 'warn',
    }
  }

  if (onFast) {
    return {
      title: `Fast Track · sueño: ${state.player.dream.title}`,
      detail: `Necesitas $${state.player.dream.cost}. Tira, busca casillas Sueño y junta efectivo.`,
      tone: 'action',
    }
  }

  return {
    title: gap === 0 ? '¡Ya puedes salir de la rata!' : `Carrera de la Rata · faltan $${gap.toLocaleString('en-US')}/mes`,
    detail:
      gap === 0
        ? 'En el próximo cierre de casilla entrarás al Fast Track.'
        : 'Tira el dado → Deals azules → compra activos hasta que el pasivo cubra gastos.',
    tone: 'action',
  }
}
