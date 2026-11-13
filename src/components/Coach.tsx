import { getCoachHint } from '../game/coach'
import type { GameState } from '../game/types'

export function Coach({ state }: { state: GameState }) {
  const hint = getCoachHint(state)

  return (
    <section className={`coach coach-${hint.tone}`} aria-live="polite">
      <p className="coach-kicker">Qué hacer ahora</p>
      <h2 className="coach-title">{hint.title}</h2>
      {hint.detail ? <p className="coach-detail">{hint.detail}</p> : null}
    </section>
  )
}
