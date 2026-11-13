import {
  cashflowRatio,
  netWorth,
  passiveIncome,
  paydayAmount,
  totalExpenses,
} from '../game/finance'
import type { PlayerState } from '../game/types'

export function Statement({ player }: { player: PlayerState }) {
  const passive = passiveIncome(player)
  const expenses = totalExpenses(player)
  const payday = paydayAmount(player)
  const ratio = cashflowRatio(player)
  const worth = netWorth(player)
  const gap = Math.max(0, expenses - passive)
  const wonReady = passive >= expenses

  return (
    <section className="panel statement">
      <header>
        <h2>Tu dinero</h2>
        <p className="muted">
          {player.career.title}
          {player.children > 0 ? ` · ${player.children} hijo${player.children === 1 ? '' : 's'}` : ''}
        </p>
      </header>

      <div className="goal-box">
        <div className="goal-equation">
          <div>
            <span className="stat-label">Ingreso pasivo</span>
            <strong className="good-text">{money(passive)}</strong>
          </div>
          <span className="goal-vs">vs</span>
          <div>
            <span className="stat-label">Gastos / mes</span>
            <strong>{money(expenses)}</strong>
          </div>
        </div>
        <p className={`goal-status ${wonReady ? 'good-text' : ''}`}>
          {wonReady
            ? 'Meta cubierta: ya saliste del circuito.'
            : `Faltan ${money(gap)}/mes de ingreso pasivo para ganar.`}
        </p>
        <div className="progress-bar" aria-hidden>
          <div className="progress-fill" style={{ width: `${Math.min(100, ratio * 100)}%` }} />
        </div>
        <p className="progress-pct">{Math.min(100, Math.round(ratio * 100))}% hacia la meta</p>
      </div>

      <div className="stat-grid compact">
        <Stat label="Efectivo ahora" value={money(player.cash)} accent={player.cash < 0 ? 'danger' : undefined} />
        <Stat label="Cobro en Payday" value={money(payday)} accent={payday >= 0 ? 'good' : 'danger'} />
        <Stat label="Salario" value={money(player.career.salary)} />
        <Stat label="Patrimonio est." value={money(worth)} />
      </div>

      <details className="details-block">
        <summary>Ver activos y deudas ({player.assets.length} activos)</summary>
        <div className="lists">
          <div>
            <h3>Activos</h3>
            {player.assets.length === 0 ? (
              <p className="muted">Aún no tienes. Busca casillas azules.</p>
            ) : (
              <ul>
                {player.assets.map((a) => (
                  <li key={a.id}>
                    <strong>{a.name}</strong>
                    <span>
                      +{money(a.cashflow)}/mes · costo {money(a.cost)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3>Deudas</h3>
            <ul>
              {player.liabilities.map((l) => (
                <li key={l.id}>
                  <strong>{l.name}</strong>
                  <span>
                    −{money(l.monthlyPayment)}/mes · debe {money(l.balance)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </section>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: 'good' | 'danger'
}) {
  return (
    <div className={`stat ${accent ?? ''}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  )
}

function money(n: number): string {
  const sign = n < 0 ? '-' : ''
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`
}
