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
  onReset: () => void
}

export function ActionPanel({ state, actions }: { state: GameState; actions: Actions }) {
  if (state.phase === 'career') {
    return (
      <section className="panel actions">
        <h2>1 · Elige profesión</h2>
        <p className="muted">
          Mira el <strong>sobrante mensual</strong>: es lo que te queda después de gastos fijos. Más sobrante = más fácil al inicio.
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

  if (state.phase === 'won') {
    return (
      <section className="panel actions win">
        <h2>Victoria</h2>
        <p>Tu ingreso pasivo cubre los gastos. Saliste del circuito laboral.</p>
        <button type="button" className="btn primary btn-lg pulse" onClick={actions.onReset}>
          Jugar de nuevo
        </button>
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

    return (
      <section className="panel actions highlight-panel">
        <p className="phase-badge">Oportunidad · {d.kind === 'small' ? 'Pequeña' : 'Grande'}</p>
        <h2>{d.title}</h2>
        <p>{d.description}</p>

        <div className="fact-cards">
          <div className="fact">
            <span>Enganche (pagas ahora)</span>
            <strong>{money(need)}</strong>
          </div>
          <div className="fact">
            <span>Ingreso pasivo nuevo</span>
            <strong className="good-text">+{money(d.asset.cashflow)}/mes</strong>
          </div>
          <div className="fact">
            <span>Tu efectivo</span>
            <strong className={can ? 'good-text' : 'danger-text'}>{money(state.player.cash)}</strong>
          </div>
          <div className="fact">
            <span>Tras comprar, te faltaría</span>
            <strong>{money(afterGap)}/mes para ganar</strong>
          </div>
        </div>

        {!can ? (
          <p className="inline-tip warn-tip">
            Te faltan {money(shortfall)}. Puedes pedir {loansNeeded} préstamo(s) de $1,000 y luego comprar, o pasar.
          </p>
        ) : (
          <p className="inline-tip">
            Tip: compra si el flujo es &gt; 0 y te acerca a la meta. Pasa si el enganche te deja sin colchón.
          </p>
        )}

        <div className="btn-row">
          <button
            type="button"
            className={`btn primary btn-lg ${can ? 'pulse' : ''}`}
            onClick={actions.onAcceptDeal}
            disabled={!can}
            title={can ? 'Comprar activo' : 'No te alcanza el enganche'}
          >
            {can ? 'Sí, comprar' : 'No te alcanza'}
          </button>
          {!can ? (
            <button type="button" className="btn" onClick={actions.onLoan}>
              Pedir préstamo +$1,000
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
        <p className="phase-badge warn-badge">Gasto inesperado</p>
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
        <p className="inline-tip">
          Solo vende si tienes ese activo. Si no lo tienes, elige “No vender”.
        </p>
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

  return (
    <section className="panel actions highlight-panel">
      <p className="phase-badge">Tu turno · #{state.turn || 1}</p>
      <h2>Tira el dado</h2>
      <p className="muted">
        Avanzas por el tablero. Las casillas verdes te pagan; las azules ofrecen activos.
        {charity > 0 ? ` Caridad activa: dado 1–12 (${charity} turno${charity === 1 ? '' : 's'}).` : ''}
      </p>
      <div className="btn-row">
        <button type="button" className="btn primary btn-lg pulse" onClick={actions.onRoll} autoFocus>
          🎲 Tirar dado
        </button>
        <button
          type="button"
          className="btn"
          onClick={actions.onLoan}
          title="Recibes $1,000 y pagas $100 extra cada mes"
        >
          Préstamo +$1,000
        </button>
        <button type="button" className="btn ghost" onClick={actions.onReset}>
          Reiniciar
        </button>
      </div>
      <p className="hint-keys">Atajo: barra espaciadora o Enter para tirar</p>
    </section>
  )
}

function money(n: number): string {
  const sign = n < 0 ? '-' : ''
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`
}
