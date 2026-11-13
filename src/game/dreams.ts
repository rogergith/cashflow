import type { Dream } from './types'

export const DREAMS: Dream[] = [
  { id: 'cabin', title: 'Cabaña en la montaña', cost: 45000 },
  { id: 'boat', title: 'Velero', cost: 60000 },
  { id: 'school', title: 'Fundar una escuela', cost: 80000 },
  { id: 'cafe', title: 'Abrir un café', cost: 35000 },
  { id: 'trip', title: 'Viaje alrededor del mundo', cost: 50000 },
]

export function pickDream(): Dream {
  return DREAMS[Math.floor(Math.random() * DREAMS.length)]!
}
