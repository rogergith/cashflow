import type { BoardSquare } from './types'

/** 24-square loop around the canvas board. */
export const BOARD: BoardSquare[] = [
  { index: 0, kind: 'start', label: 'Inicio / Payday' },
  { index: 1, kind: 'opportunity', label: 'Oportunidad' },
  { index: 2, kind: 'doodad', label: 'Gasto' },
  { index: 3, kind: 'opportunity', label: 'Oportunidad' },
  { index: 4, kind: 'charity', label: 'Caridad' },
  { index: 5, kind: 'payday', label: 'Payday' },
  { index: 6, kind: 'market', label: 'Mercado' },
  { index: 7, kind: 'opportunity', label: 'Oportunidad' },
  { index: 8, kind: 'doodad', label: 'Gasto' },
  { index: 9, kind: 'baby', label: 'Hijo/a' },
  { index: 10, kind: 'payday', label: 'Payday' },
  { index: 11, kind: 'opportunity', label: 'Oportunidad' },
  { index: 12, kind: 'downsized', label: 'Despido' },
  { index: 13, kind: 'opportunity', label: 'Oportunidad' },
  { index: 14, kind: 'doodad', label: 'Gasto' },
  { index: 15, kind: 'payday', label: 'Payday' },
  { index: 16, kind: 'market', label: 'Mercado' },
  { index: 17, kind: 'opportunity', label: 'Oportunidad' },
  { index: 18, kind: 'charity', label: 'Caridad' },
  { index: 19, kind: 'doodad', label: 'Gasto' },
  { index: 20, kind: 'payday', label: 'Payday' },
  { index: 21, kind: 'opportunity', label: 'Oportunidad' },
  { index: 22, kind: 'market', label: 'Mercado' },
  { index: 23, kind: 'opportunity', label: 'Oportunidad' },
]

export const BOARD_SIZE = BOARD.length

export function squareColor(kind: BoardSquare['kind']): string {
  switch (kind) {
    case 'payday':
    case 'start':
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
    default:
      return '#4a5568'
  }
}
