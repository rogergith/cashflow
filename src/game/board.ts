import type { BoardSquare, Track } from './types'

/** Carrera de la rata — circuito laboral interior. */
export const RAT_RACE: BoardSquare[] = [
  { index: 0, kind: 'start', label: 'Payday' },
  { index: 1, kind: 'opportunity', label: 'Deal' },
  { index: 2, kind: 'doodad', label: 'Gasto' },
  { index: 3, kind: 'opportunity', label: 'Deal' },
  { index: 4, kind: 'charity', label: 'Donar' },
  { index: 5, kind: 'payday', label: 'Payday' },
  { index: 6, kind: 'market', label: 'Mercado' },
  { index: 7, kind: 'opportunity', label: 'Deal' },
  { index: 8, kind: 'doodad', label: 'Gasto' },
  { index: 9, kind: 'baby', label: 'Hijo' },
  { index: 10, kind: 'payday', label: 'Payday' },
  { index: 11, kind: 'opportunity', label: 'Deal' },
  { index: 12, kind: 'downsized', label: 'Despido' },
  { index: 13, kind: 'opportunity', label: 'Deal' },
  { index: 14, kind: 'doodad', label: 'Gasto' },
  { index: 15, kind: 'payday', label: 'Payday' },
  { index: 16, kind: 'market', label: 'Mercado' },
  { index: 17, kind: 'opportunity', label: 'Deal' },
  { index: 18, kind: 'charity', label: 'Donar' },
  { index: 19, kind: 'doodad', label: 'Gasto' },
  { index: 20, kind: 'payday', label: 'Payday' },
  { index: 21, kind: 'opportunity', label: 'Deal' },
  { index: 22, kind: 'market', label: 'Mercado' },
  { index: 23, kind: 'opportunity', label: 'Deal' },
]

/** Fast Track — pista exterior tras salir de la rata. */
export const FAST_TRACK: BoardSquare[] = [
  { index: 0, kind: 'cashflow_day', label: 'Cashflow' },
  { index: 1, kind: 'opportunity', label: 'Gran deal' },
  { index: 2, kind: 'dream', label: 'Sueño' },
  { index: 3, kind: 'doodad', label: 'Lujo' },
  { index: 4, kind: 'cashflow_day', label: 'Cashflow' },
  { index: 5, kind: 'market', label: 'Mercado' },
  { index: 6, kind: 'opportunity', label: 'Gran deal' },
  { index: 7, kind: 'dream', label: 'Sueño' },
  { index: 8, kind: 'cashflow_day', label: 'Cashflow' },
  { index: 9, kind: 'doodad', label: 'Lujo' },
  { index: 10, kind: 'opportunity', label: 'Gran deal' },
  { index: 11, kind: 'dream', label: 'Sueño' },
  { index: 12, kind: 'cashflow_day', label: 'Cashflow' },
  { index: 13, kind: 'market', label: 'Mercado' },
  { index: 14, kind: 'opportunity', label: 'Gran deal' },
  { index: 15, kind: 'dream', label: 'Sueño' },
]

/** @deprecated use getBoard(track) */
export const BOARD = RAT_RACE
export const BOARD_SIZE = RAT_RACE.length

export function getBoard(track: Track): BoardSquare[] {
  return track === 'fast_track' ? FAST_TRACK : RAT_RACE
}

export function getBoardSize(track: Track): number {
  return getBoard(track).length
}

export function squareColor(kind: BoardSquare['kind']): string {
  switch (kind) {
    case 'payday':
    case 'start':
    case 'cashflow_day':
      return '#1f7a4d'
    case 'opportunity':
      return '#2b6cb0'
    case 'doodad':
      return '#c05621'
    case 'market':
      return '#6b46c1'
    case 'charity':
      return '#2c7a7b'
    case 'downsized':
      return '#9b2c2c'
    case 'baby':
      return '#b7791f'
    case 'dream':
      return '#ca8a04'
    default:
      return '#4a5568'
  }
}
