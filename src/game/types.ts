export type SquareKind =
  | 'payday'
  | 'opportunity'
  | 'doodad'
  | 'market'
  | 'charity'
  | 'downsized'
  | 'baby'
  | 'start'

export type DealKind = 'small' | 'big'

export interface Career {
  id: string
  title: string
  salary: number
  taxes: number
  homeMortgage: number
  carLoan: number
  creditCard: number
  retailDebt: number
  otherExpenses: number
  perChildExpense: number
  savings: number
}

export interface Asset {
  id: string
  name: string
  kind: 'stock' | 'real_estate' | 'business' | 'fund'
  cost: number
  downPayment: number
  cashflow: number
  shares?: number
  mortgage?: number
}

export interface Liability {
  id: string
  name: string
  balance: number
  monthlyPayment: number
}

export interface BoardSquare {
  index: number
  kind: SquareKind
  label: string
}

export interface DealCard {
  id: string
  kind: DealKind
  title: string
  description: string
  asset: Omit<Asset, 'id'>
}

export interface DoodadCard {
  id: string
  title: string
  description: string
  cost: number
}

export interface MarketCard {
  id: string
  title: string
  description: string
  /** Matches asset name substring or kind */
  match: { kind?: Asset['kind']; nameIncludes?: string }
  sellPrice: number
  perShare?: boolean
}

export type Phase =
  | 'career'
  | 'playing'
  | 'deal'
  | 'doodad'
  | 'market'
  | 'won'

export interface LogEntry {
  id: string
  text: string
}

export interface PlayerState {
  name: string
  career: Career
  cash: number
  position: number
  children: number
  assets: Asset[]
  liabilities: Liability[]
  charityTurnsLeft: number
}

export interface GameState {
  phase: Phase
  player: PlayerState | null
  lastRoll: number | null
  pendingDeal: DealCard | null
  pendingDoodad: DoodadCard | null
  pendingMarket: MarketCard | null
  log: LogEntry[]
  turn: number
}
