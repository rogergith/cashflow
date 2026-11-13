const ITEMS = [
  { color: '#1f7a4d', label: 'Cobro / CF Day', tip: 'Cobra salario + pasivo − gastos' },
  { color: '#2b6cb0', label: 'Deal', tip: 'Oportunidad de activo (círculo = rata)' },
  { color: '#c05621', label: 'Gasto', tip: 'Pierdes efectivo' },
  { color: '#6b46c1', label: 'Mercado', tip: 'Puedes vender activos' },
  { color: '#2c7a7b', label: 'Donar', tip: '10% salario → dado 1–12' },
  { color: '#9b2c2c', label: 'Despido', tip: 'Pagas un mes de gastos' },
  { color: '#b7791f', label: 'Hijo/a', tip: 'Suben gastos mensuales' },
  { color: '#ca8a04', label: 'Sueño', tip: 'Fast Track: compra tu sueño y ganas' },
]

export function Legend() {
  return (
    <section className="panel legend">
      <h2>Pistas del tablero</h2>
      <p className="muted" style={{ marginBottom: 10 }}>
        Círculo = Carrera de la Rata · Marco exterior = Fast Track
      </p>
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
