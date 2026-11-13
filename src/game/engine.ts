import { BOARD, BOARD_SIZE } from './board'
import { CAREERS, careerStartingLiabilities } from './careers'
import { drawDeal, drawDoodad, drawMarket } from './cards'
import { hasEscapedRatRace, paydayAmount, totalExpenses } from './finance'
import type {
  Asset,
  Career,
  DealCard,
  GameState,
  LogEntry,
  MarketCard,
  PlayerState,
} from './types'

let logSeq = 0

function entry(text: string): LogEntry {
  logSeq += 1
  return { id: `log-${logSeq}`, text }
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function pushLog(state: GameState, lines: string[]): GameState {
  const added = lines.map(entry)
  return { ...state, log: [...added, ...state.log].slice(0, 40) }
}

export function createInitialState(): GameState {
  return {
    phase: 'career',
    player: null,
    lastRoll: null,
    pendingDeal: null,
    pendingDoodad: null,
    pendingMarket: null,
    log: [entry('Elige una profesión para empezar Cashflow Lab.')],
    turn: 0,
  }
}

export function listCareers(): Career[] {
  return CAREERS
}

export function startWithCareer(state: GameState, careerId: string, name = 'Tú'): GameState {
  const career = CAREERS.find((c) => c.id === careerId)
  if (!career) return state

  const player: PlayerState = {
    name,
    career,
    cash: career.savings,
    position: 0,
    children: 0,
    assets: [],
    liabilities: careerStartingLiabilities(career),
    charityTurnsLeft: 0,
  }

  return pushLog(
    { ...state, phase: 'playing', player },
    [
      `Empiezas como ${career.title}. Efectivo: $${career.savings}.`,
      'Meta: ingreso pasivo ≥ gastos mensuales.',
    ],
  )
}

function withPlayer(state: GameState, player: PlayerState, patch: Partial<GameState> = {}): GameState {
  return { ...state, player, ...patch }
}

function applyPayday(player: PlayerState, times: number): { player: PlayerState; notes: string[] } {
  let next = player
  const notes: string[] = []
  for (let i = 0; i < times; i++) {
    const pay = paydayAmount(next)
    next = { ...next, cash: next.cash + pay }
    notes.push(`Payday: ${pay >= 0 ? '+' : ''}$${pay}`)
  }
  return { player: next, notes }
}

function countPaydaysPassed(from: number, steps: number): number {
  let count = 0
  for (let s = 1; s <= steps; s++) {
    const idx = (from + s) % BOARD_SIZE
    const square = BOARD[idx]!
    if (square.kind === 'payday' || square.kind === 'start') count += 1
  }
  return count
}

function maybeWin(state: GameState): GameState {
  if (!state.player || state.phase === 'won') return state
  if (!hasEscapedRatRace(state.player)) return state
  return pushLog(
    { ...state, phase: 'won' },
    ['¡Saliste del circuito! Ingreso pasivo cubre tus gastos. Victoria.'],
  )
}

export function rollDice(state: GameState): GameState {
  if (state.phase !== 'playing' || !state.player) return state

  const max = state.player.charityTurnsLeft > 0 ? 12 : 6
  const roll = 1 + Math.floor(Math.random() * max)
  const from = state.player.position
  const to = (from + roll) % BOARD_SIZE
  const paydays = countPaydaysPassed(from, roll)

  let player: PlayerState = { ...state.player, position: to }
  const notes: string[] = [`Tiraste ${roll}.`]

  if (player.charityTurnsLeft > 0) {
    player = { ...player, charityTurnsLeft: player.charityTurnsLeft - 1 }
  }

  if (paydays > 0) {
    const paid = applyPayday(player, paydays)
    player = paid.player
    notes.push(...paid.notes)
  }

  const square = BOARD[to]!
  notes.push(`Caíste en: ${square.label}.`)

  let next: GameState = withPlayer(
    {
      ...state,
      lastRoll: roll,
      turn: state.turn + 1,
      pendingDeal: null,
      pendingDoodad: null,
      pendingMarket: null,
      phase: 'playing',
    },
    player,
  )

  switch (square.kind) {
    case 'opportunity': {
      const deal = drawDeal()
      next = pushLog(
        { ...next, phase: 'deal', pendingDeal: deal },
        [...notes, `Carta: ${deal.title} (${deal.kind === 'small' ? 'pequeña' : 'grande'}).`],
      )
      return next
    }
    case 'doodad': {
      const doodad = drawDoodad()
      next = pushLog(
        { ...next, phase: 'doodad', pendingDoodad: doodad },
        [...notes, `Gasto: ${doodad.title} ($${doodad.cost}).`],
      )
      return next
    }
    case 'market': {
      const market = drawMarket()
      next = pushLog(
        { ...next, phase: 'market', pendingMarket: market },
        [...notes, `Mercado: ${market.title}.`],
      )
      return next
    }
    case 'charity': {
      const cost = Math.round(player.career.salary * 0.1)
      if (player.cash >= cost) {
        player = {
          ...player,
          cash: player.cash - cost,
          charityTurnsLeft: Math.max(player.charityTurnsLeft, 3),
        }
        notes.push(`Donaste $${cost}. Próximos 3 turnos tiras 1–12.`)
      } else {
        notes.push(`No tienes $${cost} para caridad. Sin efecto.`)
      }
      next = withPlayer(next, player)
      break
    }
    case 'baby': {
      if (player.children < 3) {
        player = { ...player, children: player.children + 1 }
        notes.push(`¡Nuevo hijo/a! Hijos: ${player.children}. +$${player.career.perChildExpense}/mes.`)
      } else {
        notes.push('Ya tienes 3 hijos. Sin cambio.')
      }
      next = withPlayer(next, player)
      break
    }
    case 'downsized': {
      const cost = totalExpenses(player)
      player = { ...player, cash: player.cash - cost }
      notes.push(`Despido: pagas un mes de gastos ($${cost}).`)
      next = withPlayer(next, player)
      break
    }
    default:
      break
  }

  next = pushLog(next, notes)

  if (player.cash < 0) {
    next = pushLog(next, ['Efectivo negativo: usa préstamo bancario si lo necesitas.'])
  }

  return maybeWin(next)
}

export function acceptDeal(state: GameState): GameState {
  if (state.phase !== 'deal' || !state.player || !state.pendingDeal) return state
  const deal = state.pendingDeal
  const need = deal.asset.downPayment

  if (state.player.cash < need) {
    return pushLog(
      { ...state, phase: 'playing', pendingDeal: null },
      [`No tienes $${need} de enganche. Oportunidad perdida.`],
    )
  }

  const asset: Asset = { ...deal.asset, id: uid('asset') }
  let liabilities = state.player.liabilities
  if (asset.mortgage && asset.mortgage > 0) {
    liabilities = [
      ...liabilities,
      {
        id: uid('mort'),
        name: `Hipoteca ${asset.name}`,
        balance: asset.mortgage,
        monthlyPayment: Math.round(asset.mortgage * 0.01),
      },
    ]
  }

  const player: PlayerState = {
    ...state.player,
    cash: state.player.cash - need,
    assets: [...state.player.assets, asset],
    liabilities,
  }

  return maybeWin(
    pushLog(withPlayer({ ...state, phase: 'playing', pendingDeal: null }, player), [
      `Compraste ${asset.name}. Flujo: $${asset.cashflow}/mes. Enganche: $${need}.`,
    ]),
  )
}

export function declineDeal(state: GameState): GameState {
  if (state.phase !== 'deal' || !state.pendingDeal) return state
  return pushLog(
    { ...state, phase: 'playing', pendingDeal: null },
    [`Pasaste: ${state.pendingDeal.title}.`],
  )
}

export function resolveDoodad(state: GameState): GameState {
  if (state.phase !== 'doodad' || !state.player || !state.pendingDoodad) return state
  const cost = state.pendingDoodad.cost
  const player = { ...state.player, cash: state.player.cash - cost }
  return pushLog(
    withPlayer({ ...state, phase: 'playing', pendingDoodad: null }, player),
    [`Pagaste $${cost} por ${state.pendingDoodad.title}.`],
  )
}

function assetMatches(asset: Asset, market: MarketCard): boolean {
  if (market.match.kind && asset.kind !== market.match.kind) return false
  if (market.match.nameIncludes && !asset.name.includes(market.match.nameIncludes)) return false
  return Boolean(market.match.kind || market.match.nameIncludes)
}

export function sellMatchingAssets(state: GameState): GameState {
  if (state.phase !== 'market' || !state.player || !state.pendingMarket) return state
  const market = state.pendingMarket
  const matches = state.player.assets.filter((a) => assetMatches(a, market))

  if (matches.length === 0) {
    return pushLog(
      { ...state, phase: 'playing', pendingMarket: null },
      ['No tienes activos que coincidan con esta carta de mercado.'],
    )
  }

  let cash = state.player.cash
  let assets = [...state.player.assets]
  let liabilities = [...state.player.liabilities]
  const soldNames: string[] = []

  for (const asset of matches) {
    let proceeds: number
    if (market.perShare && asset.shares) {
      proceeds = market.sellPrice * asset.shares
    } else {
      proceeds = market.sellPrice
    }

    const relatedMort = liabilities.find((l) => l.name.includes(asset.name))
    if (relatedMort) {
      proceeds -= relatedMort.balance
      liabilities = liabilities.filter((l) => l.id !== relatedMort.id)
    }

    cash += proceeds
    assets = assets.filter((a) => a.id !== asset.id)
    soldNames.push(`${asset.name} (+$${proceeds})`)
  }

  const player: PlayerState = { ...state.player, cash, assets, liabilities }
  return maybeWin(
    pushLog(withPlayer({ ...state, phase: 'playing', pendingMarket: null }, player), [
      `Vendiste: ${soldNames.join(', ')}.`,
    ]),
  )
}

export function skipMarket(state: GameState): GameState {
  if (state.phase !== 'market') return state
  return pushLog(
    { ...state, phase: 'playing', pendingMarket: null },
    ['No vendiste nada en el mercado.'],
  )
}

export function takeBankLoan(state: GameState, amount: number): GameState {
  if (!state.player || amount <= 0) return state
  const rounded = Math.ceil(amount / 1000) * 1000
  const monthly = Math.round(rounded * 0.1)
  const player: PlayerState = {
    ...state.player,
    cash: state.player.cash + rounded,
    liabilities: [
      ...state.player.liabilities,
      {
        id: uid('bank'),
        name: `Préstamo banco $${rounded}`,
        balance: rounded,
        monthlyPayment: monthly,
      },
    ],
  }
  return pushLog(withPlayer(state, player), [
    `Préstamo bancario +$${rounded}. Nuevo gasto mensual: $${monthly}.`,
  ])
}

export function resetGame(): GameState {
  return createInitialState()
}

export function dealDownPayment(deal: DealCard): number {
  return deal.asset.downPayment
}
