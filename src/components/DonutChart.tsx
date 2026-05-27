interface DonutChartProps {
  total: number
  redCount: number
  yellowCount: number
  greenCount: number
}

const TOTAL_STROKE = 377

export default function DonutChart({ total, redCount, yellowCount, greenCount }: DonutChartProps) {
  const pctRed = total > 0 ? (redCount / total) * 100 : 0
  const pctYellow = total > 0 ? (yellowCount / total) * 100 : 0
  const pctGreen = total > 0 ? (greenCount / total) * 100 : 0

  const offsetRed = total > 0 ? TOTAL_STROKE - (TOTAL_STROKE * (pctRed / 100)) : TOTAL_STROKE
  const offsetYellow = total > 0 ? TOTAL_STROKE - (TOTAL_STROKE * ((pctRed + pctYellow) / 100)) : TOTAL_STROKE
  const offsetGreen = total > 0 ? 0 : TOTAL_STROKE

  return (
    <div className="chart-panel antigravity-card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: 20, borderBottom: "1px solid rgba(15,118,110,0.05)", paddingBottom: 8 }}>
        Prioridades Atendidas
      </h3>
      <div className="donut-chart-box">
        <div className="donut-chart">
          <svg width="140" height="140">
            <circle className="donut-circle-bg" cx="70" cy="70" r="60" />
            <circle className="donut-circle-val" cx="70" cy="70" r="60"
              stroke="var(--priority-red)"
              style={{ strokeDashoffset: offsetRed, strokeDasharray: String(TOTAL_STROKE) }} />
            <circle className="donut-circle-val" cx="70" cy="70" r="60"
              stroke="var(--priority-yellow)"
              style={{ strokeDashoffset: offsetYellow, strokeDasharray: `${TOTAL_STROKE} ${TOTAL_STROKE}` }} />
            <circle className="donut-circle-val" cx="70" cy="70" r="60"
              stroke="var(--priority-green)"
              style={{ strokeDashoffset: offsetGreen, strokeDasharray: `${TOTAL_STROKE} ${TOTAL_STROKE}` }} />
          </svg>
          <div className="donut-center-text">
            <span className="num">{total}</span><br />
            <span className="lbl">Fichas</span>
          </div>
        </div>
        <div className="legend-container">
          <div className="legend-item">
            <span className="legend-color" style={{ background: "var(--priority-red)" }} />
            <span>Vermelho ({Math.round(pctRed)}%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: "var(--priority-yellow)" }} />
            <span>Amarelo ({Math.round(pctYellow)}%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: "var(--priority-green)" }} />
            <span>Verde ({Math.round(pctGreen)}%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
