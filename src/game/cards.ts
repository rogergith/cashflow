import type { DealCard, DoodadCard, MarketCard } from './types'

export const SMALL_DEALS: DealCard[] = [
  {
    id: 'sd-etf',
    kind: 'small',
    title: 'ETF de dividendos',
    description: 'Compra un ETF que paga dividendos mensuales.',
    asset: {
      name: 'ETF Dividendos',
      kind: 'fund',
      cost: 1000,
      downPayment: 1000,
      cashflow: 20,
      shares: 100,
    },
  },
  {
    id: 'sd-tech',
    kind: 'small',
    title: 'Acciones TechCo',
    description: 'Paquete de acciones de una startup tecnológica.',
    asset: {
      name: 'TechCo',
      kind: 'stock',
      cost: 500,
      downPayment: 500,
      cashflow: 0,
      shares: 100,
    },
  },
  {
    id: 'sd-crypto-fund',
    kind: 'small',
    title: 'Fondo indexado',
    description: 'Fondo amplio de mercado. Bajo flujo, buena liquidez.',
    asset: {
      name: 'Index Fund',
      kind: 'fund',
      cost: 800,
      downPayment: 800,
      cashflow: 8,
      shares: 80,
    },
  },
  {
    id: 'sd-vending',
    kind: 'small',
    title: 'Máquina expendedora',
    description: 'Negocio chico con flujo estable.',
    asset: {
      name: 'Vending',
      kind: 'business',
      cost: 2000,
      downPayment: 2000,
      cashflow: 80,
    },
  },
  {
    id: 'sd-condo-share',
    kind: 'small',
    title: 'Fracción de condo',
    description: 'Participación pequeña en un condominio rentado.',
    asset: {
      name: 'Condo fraccional',
      kind: 'real_estate',
      cost: 5000,
      downPayment: 1000,
      cashflow: 40,
      mortgage: 4000,
    },
  },
]

export const BIG_DEALS: DealCard[] = [
  {
    id: 'bd-duplex',
    kind: 'big',
    title: 'Dúplex en alquiler',
    description: 'Dos unidades. Buen flujo neto tras hipoteca.',
    asset: {
      name: 'Dúplex',
      kind: 'real_estate',
      cost: 65000,
      downPayment: 8000,
      cashflow: 240,
      mortgage: 57000,
    },
  },
  {
    id: 'bd-plaza',
    kind: 'big',
    title: 'Local comercial',
    description: 'Local arrendado a una tienda de barrio.',
    asset: {
      name: 'Local comercial',
      kind: 'real_estate',
      cost: 120000,
      downPayment: 20000,
      cashflow: 450,
      mortgage: 100000,
    },
  },
  {
    id: 'bd-laundry',
    kind: 'big',
    title: 'Lavandería',
    description: 'Negocio con equipos y flujo recurrente.',
    asset: {
      name: 'Lavandería',
      kind: 'business',
      cost: 40000,
      downPayment: 12000,
      cashflow: 320,
      mortgage: 28000,
    },
  },
  {
    id: 'bd-apartments',
    kind: 'big',
    title: 'Edificio 4 unidades',
    description: 'Cuatro departamentos. Escala de cashflow.',
    asset: {
      name: '4-plex',
      kind: 'real_estate',
      cost: 180000,
      downPayment: 25000,
      cashflow: 700,
      mortgage: 155000,
    },
  },
]

export const DOODADS: DoodadCard[] = [
  { id: 'd1', title: 'Cena en restaurante', description: 'Salida con amigos.', cost: 80 },
  { id: 'd2', title: 'Nuevo celular', description: 'Upgrade inesperado.', cost: 400 },
  { id: 'd3', title: 'Vacaciones cortas', description: 'Fin de semana fuera.', cost: 600 },
  { id: 'd4', title: 'Reparación del auto', description: 'Mecánica urgente.', cost: 350 },
  { id: 'd5', title: 'Suscripciones', description: 'Apps y streaming acumulados.', cost: 120 },
  { id: 'd6', title: 'Ropa y gadgets', description: 'Compras impulsivas.', cost: 250 },
]

export const MARKET: MarketCard[] = [
  {
    id: 'm1',
    title: 'Rally TechCo',
    description: 'Las acciones TechCo suben. Puedes vender a $15/acción.',
    match: { nameIncludes: 'TechCo' },
    sellPrice: 15,
    perShare: true,
  },
  {
    id: 'm2',
    title: 'Comprador de dúplex',
    description: 'Un inversionista ofrece $80,000 por tu dúplex.',
    match: { nameIncludes: 'Dúplex' },
    sellPrice: 80000,
  },
  {
    id: 'm3',
    title: 'Interés en locales',
    description: 'Oferta de $140,000 por local comercial.',
    match: { nameIncludes: 'Local comercial' },
    sellPrice: 140000,
  },
  {
    id: 'm4',
    title: 'Fondo caliente',
    description: 'Vende ETF Dividendos a $14/acción.',
    match: { nameIncludes: 'ETF Dividendos' },
    sellPrice: 14,
    perShare: true,
  },
  {
    id: 'm5',
    title: 'Compra de negocios',
    description: 'Alguien paga $8,000 por tu lavandería (equity).',
    match: { nameIncludes: 'Lavandería' },
    sellPrice: 8000,
  },
]

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

export function drawDeal(): DealCard {
  return Math.random() < 0.65 ? pick(SMALL_DEALS) : pick(BIG_DEALS)
}

export function drawDoodad(): DoodadCard {
  return pick(DOODADS)
}

export function drawMarket(): MarketCard {
  return pick(MARKET)
}
