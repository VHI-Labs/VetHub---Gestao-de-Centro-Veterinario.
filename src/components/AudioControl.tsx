import { useState, useEffect } from "react"
import { VolumeX, Volume2 } from "lucide-react"

export default function AudioControl() {
  const [muted, setMuted] = useState(() => localStorage.getItem("vethub_video_muted") === "true")

  useEffect(() => {
    localStorage.setItem("vethub_video_muted", muted ? "true" : "false")
    window.dispatchEvent(new Event("storage-sync"))
  }, [muted])

  return (
    <section
      className="antigravity-card"
      style={{
        marginTop: 24,
        padding: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "min(760px, 100%)"
      }}
    >
      <div>
        <h2 style={{ color: "var(--color-primary)", fontSize: "1.4rem", marginBottom: 6 }}>Áudio das TVs</h2>
        <p style={{ color: "var(--text-muted)" }}>
          Controle se os vídeos nos painéis de TV serão reproduzidos com som ou de forma muda.
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        <span style={{ fontSize: "1.8rem", display: "flex", alignItems: "center" }}>{muted ? <VolumeX size={32} /> : <Volume2 size={32} />}</span>
        <label className="switch">
          <input type="checkbox" checked={!muted} onChange={() => setMuted(!muted)} />
          <span className="slider round" />
        </label>
      </div>
    </section>
  )
}
