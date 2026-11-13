import { careerFixedExpenses } from '../game/careers'
import { CAREERS } from '../game/careers'
import { dealDownPayment } from '../game/engine'
import { passiveIncome, totalExpenses } from '../game/finance'
import type { GameState } from '../game/types'

interface Actions {
  onPickCareer: (id: string) => void
  onRoll: () => void
  onAcceptDeal: () => void
  onDeclineDeal: () => void
  onResolveDoodad: () => void
  onSellMarket: () => void
  onSkipMarket: () => void
  onLoan: () => void
  onRepay: () => void
  onEndTurn: () => void
  onReset: () => void
}

export function ActionPanel({
  state,
  actions,
  animating = false,
}: {
  state: GameState
  actions: Actions
  animating?: boolean
}) {
  if (state.phase === 'career') {
    return (
      <section className="panel actions">
        <h2>1 · Elige profesión</h2>
        <p className="muted">
          Entras a la <strong>Carrera de la Rata</strong>. Saldrás cuando el ingreso pasivo cubra tus gastos.
        </p>
        <div className="career-grid">
          {CAREERS.map((c) => {
            const expenses = careerFixedExpenses(c, 0)
            const leftover = c.salary - expenses
            const ease = leftover >= 1200 ? 'Más fácil' : leftover >= 700 ? 'Equilibrada' : 'Más exigente'
            return (
              <button
                key={c.id}
                type="button"
                className="career-card"
                onClick={() => actions.onPickCareer(c.id)}
              >
                <strong>{c.title}</strong>
                <span>Salario {money(c.salary)} · Gastos {money(expenses)}</span>
                <span className={leftover >= 0 ? 'good-text' : 'danger-text'}>
                  Sobrante {money(leftover)}/mes
                </span>
                <span className="career-ease">{ease}</span>
                <span className="career-cta">Empezar →</span>
              </button>
            )
          })}
        </div>
      </section>
    )
  }

  if (state.phase === 'won' && state.player) {
    return (
      <section className="panel actions win">
        <h2>Victoria</h2>
        <p>
          Saliste de la rata y lograste tu sueño: <strong>{state.player.dream.title}</strong>.
        </p>
        <button type="button" className="btn primary btn-lg pulse" onClick={actions.onReset}>
          Jugar de nuevo
        </button>
      </section>
    )
  }

  if (state.phase === 'end_turn' && state.player) {
    const onFast = state.player.track === 'fast_track'
    return (
      <section className="panel actions highlight-panel">
        <p className={`phase-badge ${onFast ? '' : 'warn-badge'}`}>
          {state.justEscaped ? '¡Escapaste de la rata!' : 'Fin de turno'}
        </p>
        <h2>{onFast ? 'Fast Track' : 'Carrera de la Rata'}</h2>
        <p className="muted">
          Revisa tu estado financiero. Puedes pedir o pagar un préstamo antes de cerrar.
          {onFast ? ` Sueño: ${state.player.dream.title} (${money(state.player.dream.cost)}).` : ''}
        </p>
        <div className="btn-row">
          <button type="button" className="btn" onClick={actions.onLoan}>
            Pedir +$1,000
          </button>
          <button type="button" className="btn" onClick={actions.onRepay}>
            Pagar préstamo
          </button>
          <button type="button" className="btn primary btn-lg pulse" onClick={actions.onEndTurn} autoFocus>
            Terminar turno
          </button>
        </div>
      </section>
    )
  }

  if (state.phase === 'deal' && state.pendingDeal && state.player) {
    const d = state.pendingDeal
    const need = dealDownPayment(d)
    const can = state.player.cash >= need
    const shortfall = need - state.player.cash
    const loansNeeded = can ? 0 : Math.ceil(shortfall / 1000)
    const afterPassive = passiveIncome(state.player) + d.asset.cashflow
    const expenses = totalExpenses(state.player)
    const afterGap = Math.max(0, expenses - afterPassive)
    const onFast = state.player.track === 'fast_track'

    return (
      <section className="panel actions highlight-panel">
        <p className="phase-badge">Oportunidad · {d.kind === 'small' ? 'Pequeña' : 'Grande'}</p>
        <h2>{d.title}</h2>
        <p>{d.description}</p>

        <div className="fact-cards">
          <div className="fact">
            <span>Enganche</span>
            <strong>{money(need)}</strong>
          </div>
          <div className="fact">
            <span>Ingreso pasivo</span>
            <strong className="good-text">+{money(d.asset.cashflow)}/mes</strong>
          </div>
          <div className="fact">
            <span>Tu efectivo</span>
            <strong className={can ? 'good-text' : 'danger-text'}>{money(state.player.cash)}</strong>
          </div>
          <div className="fact">
            <span>{onFast ? 'Tras comprar' : 'Para salir de la rata'}</span>
            <strong>
              {onFast ? `sueño ${money(state.player.dream.cost)}` : `faltan ${money(afterGap)}/mes`}
            </strong>
          </div>
        </div>

        {!can ? (
          <p className="inline-tip warn-tip">
            Te faltan {money(shortfall)}. Puedes pedir {loansNeeded} préstamo(s) de $1,000 (+$100/mes c/u).
          </p>
        ) : (
          <p className="inline-tip">Compra si el flujo te acerca a la meta. Pasa si te quedas sin colchón.</p>
        )}

        <div className="btn-row">
          <button
            type="button"
            className={`btn primary btn-lg ${can ? 'pulse' : ''}`}
            onClick={actions.onAcceptDeal}
            disabled={!can}
          >
            {can ? 'Sí, comprar' : 'No te alcanza'}
          </button>
          {!can ? (
            <button type="button" className="btn" onClick={actions.onLoan}>
              Pedir +$1,000
            </button>
          ) : null}
          <button type="button" className="btn" onClick={actions.onDeclineDeal}>
            No, pasar
          </button>
        </div>
      </section>
    )
  }

  if (state.phase === 'doodad' && state.pendingDoodad) {
    const d = state.pendingDoodad
    return (
      <section className="panel actions highlight-panel">
        <p className="phase-badge warn-badge">Gasto</p>
        <h2>{d.title}</h2>
        <p>{d.description}</p>
        <p className="cost">−{money(d.cost)}</p>
        <button type="button" className="btn primary btn-lg pulse" onClick={actions.onResolveDoodad}>
          Entendido, pagar
        </button>
      </section>
    )
  }

  if (state.phase === 'market' && state.pendingMarket) {
    const m = state.pendingMarket
    return (
      <section className="panel actions highlight-panel">
        <p className="phase-badge market-badge">Mercado</p>
        <h2>{m.title}</h2>
        <p>{m.description}</p>
        <div className="btn-row">
          <button type="button" className="btn primary btn-lg pulse" onClick={actions.onSellMarket}>
            Vender si lo tengo
          </button>
          <button type="button" className="btn" onClick={actions.onSkipMarket}>
            No vender
          </button>
        </div>
      </section>
    )
  }

  const charity = state.player?.charityTurnsLeft ?? 0
  const onFast = state.player?.track === 'fast_track'

  return (
    <section className="panel actions highlight-panel">
      <p className="phase-badge">
        {onFast ? 'Fast Track' : 'Carrera de la Rata'} · turno #{state.turn || 1}
      </p>
      <h2>{animating ? 'Moviendo ficha…' : 'Tira el dado'}</h2>
      <p className="muted">
        {animating
          ? 'Espera a que la ficha termine de saltar.'
          : onFast
            ? `Persigue tu sueño (${state.player?.dream.title}). Casillas doradas = Sueño.`
            : 'Circuito interior: deals azules suben tu pasivo hasta salir de la rata.'}
        {!animating && charity > 0
          ? ` Caridad: dado 1–12 (${charity} turno${charity === 1 ? '' : 's'}).`
          : ''}
      </p>
      <div className="btn-row">
        <button
          type="button"
          className={`btn primary btn-lg ${animating ? '' : 'pulse'}`}
          onClick={actions.onRoll}
          disabled={animating}
          autoFocus
        >
          {animating ? 'Animando…' : 'Tirar dado'}
        </button>
        <button type="button" className="btn ghost" onClick={actions.onReset}>
          Reiniciar
        </button>
      </div>
      <p className="hint-keys">Espacio / Enter para tirar</p>
    </section>
  )
}

function money(n: number): string {
  const sign = n < 0 ? '-' : ''
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`
}
