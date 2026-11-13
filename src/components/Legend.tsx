const ITEMS = [
  { color: '#1f7a4d', label: 'Cobro', tip: 'Moneda · recibes salario + pasivo − gastos' },
  { color: '#2b6cb0', label: 'Deal', tip: 'Maletín · puedes comprar un activo' },
  { color: '#c05621', label: 'Gasto', tip: 'Bolsa · pierdes efectivo' },
  { color: '#6b46c1', label: 'Venta', tip: 'Etiqueta · puedes vender activos' },
  { color: '#2c7a7b', label: 'Donar', tip: 'Corazón · donas 10% → dado 1–12' },
  { color: '#9b2c2c', label: 'Despido', tip: 'Puerta · pagas un mes de gastos' },
  { color: '#b7791f', label: 'Hijo/a', tip: 'Persona · suben tus gastos mensuales' },
]

export function Legend() {
  return (
    <section className="panel legend">
      <h2>Casillas del tablero</h2>
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
