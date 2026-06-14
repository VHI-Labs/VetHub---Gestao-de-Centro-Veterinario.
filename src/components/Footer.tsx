export default function Footer() {
  return (
    <footer style={{
      textAlign: "center", padding: "16px 24px",
      borderTop: "1px solid rgba(0,0,0,0.06)",
      color: "rgba(0,0,0,0.35)", fontSize: "0.78rem",
      fontWeight: 500, lineHeight: 1.6
    }}>
      <a href="https://vitorsantos.dev" target="_blank" rel="noopener noreferrer"
        style={{ color: "inherit", textDecoration: "underline", textDecorationColor: "rgba(0,0,0,0.15)" }}>
        Vitor Santos
      </a>
      {" (NSI — Campus Piracicaba) & "}
      <a href="https://ingridbrito.dev" target="_blank" rel="noopener noreferrer"
        style={{ color: "inherit", textDecoration: "underline", textDecorationColor: "rgba(0,0,0,0.15)" }}>
        Ingrid Brito
      </a>
      {" (NSI — Campus Mooca) — HOVET © 2026"}
    </footer>
  )
}
