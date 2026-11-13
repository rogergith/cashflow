const ITEMS = [
  { color: '#1f7a4d', label: 'Cobro', tip: 'Al pasar o caer, recibes salario + pasivo − gastos' },
  { color: '#2b6cb0', label: 'Oportunidad', tip: 'Puedes comprar un activo' },
  { color: '#c05621', label: 'Gasto', tip: 'Pierdes efectivo' },
  { color: '#6b46c1', label: 'Mercado', tip: 'Puedes vender activos' },
  { color: '#2c7a7b', label: 'Caridad', tip: 'Donas 10% del salario → dado 1–12' },
  { color: '#9b2c2c', label: 'Despido', tip: 'Pagas un mes de gastos' },
  { color: '#b7791f', label: 'Hijo/a', tip: 'Suben tus gastos mensuales' },
]

export function Legend() {
  return (
    <section className="panel legend">
      <h2>Colores del tablero</h2>
      <ul className="legend-list">
        {ITEMS.map((item) => (
          <li key={item.label}>
            <span className="legend-swatch" style={{ background: item.color }} aria-hidden />
            <div>
              <strong>{item.label}</strong>
              <span>{item.tip}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
