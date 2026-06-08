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

  const redLen = (TOTAL_STROKE * pctRed) / 100
  const yellowLen = (TOTAL_STROKE * pctYellow) / 100
  const greenLen = (TOTAL_STROKE * pctGreen) / 100

  return (
    <div className="chart-panel antigravity-card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: 20, borderBottom: "1px solid rgba(15,118,110,0.05)", paddingBottom: 8 }}>
        Prioridades Atendidas
      </h3>
      <div className="donut-chart-box">
        <div className="donut-chart">
          <svg width="140" height="140">
            <circle className="donut-circle-bg" cx="70" cy="70" r="60" />
            {greenLen > 0 && <circle className="donut-circle-val" cx="70" cy="70" r="60"
              stroke="var(--priority-green)"
              style={{ strokeDasharray: `${greenLen} ${TOTAL_STROKE}`, strokeDashoffset: 0 }} />}
            {yellowLen > 0 && <circle className="donut-circle-val" cx="70" cy="70" r="60"
              stroke="var(--priority-yellow)"
              style={{ strokeDasharray: `${yellowLen} ${TOTAL_STROKE}`, strokeDashoffset: -greenLen || 0 }} />}
            {redLen > 0 && <circle className="donut-circle-val" cx="70" cy="70" r="60"
              stroke="var(--priority-red)"
              style={{ strokeDasharray: `${redLen} ${TOTAL_STROKE}`, strokeDashoffset: -(greenLen + yellowLen) || 0 }} />}
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
