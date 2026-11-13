import { careerFixedExpenses } from './careers'
import type { PlayerState } from './types'

export function passiveIncome(p: PlayerState): number {
  return p.assets.reduce((sum, a) => sum + a.cashflow, 0)
}

export function liabilityPayments(p: PlayerState): number {
  return p.liabilities.reduce((sum, l) => sum + l.monthlyPayment, 0)
}

export function totalExpenses(p: PlayerState): number {
  const careerPart = careerFixedExpenses(p.career, p.children)
  const extraLoans = p.liabilities
    .filter((l) => !['home', 'car', 'cc', 'retail'].includes(l.id))
    .reduce((sum, l) => sum + l.monthlyPayment, 0)
  return careerPart + extraLoans
}

export function paydayAmount(p: PlayerState): number {
  return p.career.salary + passiveIncome(p) - totalExpenses(p)
}

export function cashflowRatio(p: PlayerState): number {
  const exp = totalExpenses(p)
  if (exp <= 0) return 1
  return passiveIncome(p) / exp
}

export function hasEscapedRatRace(p: PlayerState): boolean {
  return passiveIncome(p) >= totalExpenses(p)
}

export function netWorth(p: PlayerState): number {
  const assetValue = p.assets.reduce((sum, a) => sum + a.cost, 0)
  const debt = p.liabilities.reduce((sum, l) => sum + l.balance, 0)
  return p.cash + assetValue - debt
}
