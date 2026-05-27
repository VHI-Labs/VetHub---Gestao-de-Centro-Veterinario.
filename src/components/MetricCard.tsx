interface MetricCardProps {
  icon: string
  label: string
  value: number
}

export default function MetricCard({ icon, label, value }: MetricCardProps) {
  return (
    <div className="metric-card antigravity-card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 20 }}>
      <div className="metric-icon" style={{
        width: 54, height: 54, borderRadius: 16,
        background: "rgba(15,118,110,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.8rem", color: "var(--color-primary)"
      }}>
        {icon}
      </div>
      <div className="metric-info">
        <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</h4>
        <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-main)", marginTop: 4 }}>{value}</p>
      </div>
    </div>
  )
}
