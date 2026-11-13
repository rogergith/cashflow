import type { Career } from './types'

/** Original professions for Cashflow Lab (not copied from any commercial game). */
export const CAREERS: Career[] = [
  {
    id: 'engineer',
    title: 'Ingeniero/a',
    salary: 4900,
    taxes: 1050,
    homeMortgage: 700,
    carLoan: 220,
    creditCard: 70,
    retailDebt: 50,
    otherExpenses: 1100,
    perChildExpense: 250,
    savings: 400,
  },
  {
    id: 'teacher',
    title: 'Profesor/a',
    salary: 3300,
    taxes: 500,
    homeMortgage: 400,
    carLoan: 100,
    creditCard: 40,
    retailDebt: 50,
    otherExpenses: 750,
    perChildExpense: 200,
    savings: 400,
  },
  {
    id: 'nurse',
    title: 'Enfermero/a',
    salary: 3100,
    taxes: 480,
    homeMortgage: 400,
    carLoan: 130,
    creditCard: 50,
    retailDebt: 50,
    otherExpenses: 700,
    perChildExpense: 200,
    savings: 480,
  },
  {
    id: 'mechanic',
    title: 'Mecánico/a',
    salary: 2000,
    taxes: 280,
    homeMortgage: 300,
    carLoan: 80,
    creditCard: 60,
    retailDebt: 50,
    otherExpenses: 450,
    perChildExpense: 150,
    savings: 670,
  },
  {
    id: 'lawyer',
    title: 'Abogado/a',
    salary: 7500,
    taxes: 1800,
    homeMortgage: 1100,
    carLoan: 380,
    creditCard: 180,
    retailDebt: 50,
    otherExpenses: 1600,
    perChildExpense: 380,
    savings: 400,
  },
  {
    id: 'pilot',
    title: 'Piloto/a',
    salary: 9500,
    taxes: 2350,
    homeMortgage: 1350,
    carLoan: 430,
    creditCard: 220,
    retailDebt: 50,
    otherExpenses: 2200,
    perChildExpense: 400,
    savings: 400,
  },
]

export function careerFixedExpenses(c: Career, children: number): number {
  return (
    c.taxes +
    c.homeMortgage +
    c.carLoan +
    c.creditCard +
    c.retailDebt +
    c.otherExpenses +
    children * c.perChildExpense
  )
}

export function careerStartingLiabilities(c: Career) {
  return [
    { id: 'home', name: 'Hipoteca vivienda', balance: c.homeMortgage * 100, monthlyPayment: c.homeMortgage },
    { id: 'car', name: 'Préstamo auto', balance: c.carLoan * 40, monthlyPayment: c.carLoan },
    { id: 'cc', name: 'Tarjeta de crédito', balance: c.creditCard * 30, monthlyPayment: c.creditCard },
    { id: 'retail', name: 'Deuda retail', balance: c.retailDebt * 20, monthlyPayment: c.retailDebt },
  ]
}
