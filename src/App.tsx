import { useEffect, useReducer } from 'react'
import { ActionPanel } from './components/ActionPanel'
import { Coach } from './components/Coach'
import { GameCanvas } from './components/GameCanvas'
import { Legend } from './components/Legend'
import { Statement } from './components/Statement'
import {
  acceptDeal,
  createInitialState,
  declineDeal,
  resetGame,
  resolveDoodad,
  rollDice,
  sellMatchingAssets,
  skipMarket,
  startWithCareer,
  takeBankLoan,
} from './game/engine'
import type { GameState } from './game/types'

type Action =
  | { type: 'career'; id: string }
  | { type: 'roll' }
  | { type: 'accept' }
  | { type: 'decline' }
  | { type: 'doodad' }
  | { type: 'sell' }
  | { type: 'skipMarket' }
  | { type: 'loan' }
  | { type: 'reset' }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'career':
      return startWithCareer(state, action.id)
    case 'roll':
      return rollDice(state)
    case 'accept':
      return acceptDeal(state)
    case 'decline':
      return declineDeal(state)
    case 'doodad':
      return resolveDoodad(state)
    case 'sell':
      return sellMatchingAssets(state)
    case 'skipMarket':
      return skipMarket(state)
    case 'loan':
      return takeBankLoan(state, 1000)
    case 'reset':
      return resetGame()
    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key !== ' ' && e.key !== 'Enter') return
      e.preventDefault()

      if (state.phase === 'playing') dispatch({ type: 'roll' })
      else if (state.phase === 'doodad') dispatch({ type: 'doodad' })
      else if (state.phase === 'deal' && state.player && state.pendingDeal) {
        if (state.player.cash >= state.pendingDeal.asset.downPayment) dispatch({ type: 'accept' })
      } else if (state.phase === 'market') dispatch({ type: 'sell' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state])

  const latest = state.log[0]

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="brand">Cashflow Lab</p>
          <p className="tagline">Aprende cashflow jugando · 1 jugador local</p>
        </div>
        <p className="disclaimer">Juego educativo original. No afiliado a Rich Dad ni CASHFLOW®.</p>
      </header>

      <Coach state={state} />

      <main className="layout">
        <div className="board-col">
          <GameCanvas player={state.player} lastRoll={state.lastRoll} />
          <Legend />
        </div>

        <aside className="side-col">
          <ActionPanel
            state={state}
            actions={{
              onPickCareer: (id) => dispatch({ type: 'career', id }),
              onRoll: () => dispatch({ type: 'roll' }),
              onAcceptDeal: () => dispatch({ type: 'accept' }),
              onDeclineDeal: () => dispatch({ type: 'decline' }),
              onResolveDoodad: () => dispatch({ type: 'doodad' }),
              onSellMarket: () => dispatch({ type: 'sell' }),
              onSkipMarket: () => dispatch({ type: 'skipMarket' }),
              onLoan: () => dispatch({ type: 'loan' }),
              onReset: () => dispatch({ type: 'reset' }),
            }}
          />

          {latest ? (
            <section className="panel last-event" aria-live="polite">
              <p className="coach-kicker">Último evento</p>
              <p className="last-event-text">{latest.text}</p>
            </section>
          ) : null}

          {state.player ? <Statement player={state.player} /> : null}

          <details className="panel log-details">
            <summary>Historial completo</summary>
            <ul className="log-list">
              {state.log.map((l) => (
                <li key={l.id}>{l.text}</li>
              ))}
            </ul>
          </details>
        </aside>
      </main>
    </div>
  )
}
