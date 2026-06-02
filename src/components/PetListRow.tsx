import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import type { Pet, Species } from "../types"
import { updatePetStatus } from "../core/engine"
import { useWaitTimer } from "../hooks/useWaitTimer"
import { useQueueStore } from "../store/queueStore"
import IconMMegaphone from "react-fluentui-emoji/lib/modern/icons/IconMMegaphone"
import IconMRoundPushpin from "react-fluentui-emoji/lib/modern/icons/IconMRoundPushpin"
import IconMDogFace from "react-fluentui-emoji/lib/modern/icons/IconMDogFace"
import IconMCatFace from "react-fluentui-emoji/lib/modern/icons/IconMCatFace"
import IconMBird from "react-fluentui-emoji/lib/modern/icons/IconMBird"

interface PetListRowProps {
  pet: Pet
  showCall?: boolean
  showDirection?: boolean
  showFinish?: boolean
  callLabel?: string
  directionLabel?: string
  onAction?: () => void
}

export default function PetListRow({
  pet,
  showCall = true,
  showDirection = false,
  showFinish = true,
  callLabel = "Chamar",
  directionLabel = "Direcionar",
}: PetListRowProps) {
  const [showDirPopover, setShowDirPopover] = useState(false)
  const [calling, setCalling] = useState(false)
  const [dirPos, setDirPos] = useState({ top: 0, left: 0, width: 0 })
  const dirBtnRef = useRef<HTMLButtonElement>(null)
  const dirPopoverRef = useRef<HTMLDivElement>(null)
  const waitLabel = useWaitTimer(pet.dataHora)
  const refresh = useQueueStore(s => s.refresh)

  useEffect(() => {
    if (!showDirPopover) return
    const handler = (e: MouseEvent) => {
      if (dirPopoverRef.current && !dirPopoverRef.current.contains(e.target as Node)) {
        setShowDirPopover(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showDirPopover])

  const especieBadge = pet.especie === "Cão"
    ? { bg: "rgba(59,130,246,0.1)", color: "#2563eb", icon: <IconMDogFace size={14} />, label: "Cão" }
    : pet.especie === "Gato"
      ? { bg: "rgba(236,72,153,0.1)", color: "#db2777", icon: <IconMCatFace size={14} />, label: "Gato" }
      : { bg: "rgba(16,185,129,0.1)", color: "#059669", icon: <IconMBird size={14} />, label: "Silvestres" }

  const handleCall = () => {
    if (calling) return
    setCalling(true)
    setTimeout(async () => {
      await updatePetStatus(pet.id, pet.especie as Species, "Chamado", callLabel)
      await refresh()
      setCalling(false)
    }, 3000)
  }

  const handleDirection = async (local: string) => {
    await updatePetStatus(pet.id, pet.especie as Species, "Direcionado", local)
    setShowDirPopover(false)
    await refresh()
  }

  const handleFinish = async () => {
    await updatePetStatus(pet.id, pet.especie as Species, "Finalizado")
    await refresh()
  }

  return (
    <div className="antigravity-card pet-list-row fade-in-up" style={{ position: "relative" }}>
      <div className="pet-list-cell cell-especie">
        <span style={{
          background: especieBadge.bg, color: especieBadge.color,
          padding: "4px 12px", borderRadius: 100, fontSize: "0.8rem",
          fontWeight: 700, whiteSpace: "nowrap"
        }}>
          {especieBadge.icon} {especieBadge.label}
        </span>
      </div>

      <div className="pet-list-cell cell-atendimento">
        <span>{pet.tipoAtendimento}</span>
      </div>

      <div className="pet-list-cell cell-senha">
        <strong>{pet.senha}</strong>
      </div>

      <div className="pet-list-cell cell-espera">
        <span>{waitLabel}</span>
      </div>

      <div className="pet-list-actions">
        {showCall && (
          <button className="action-btn-block btn-call" onClick={handleCall}
            disabled={calling}
            style={{ opacity: calling ? 0.5 : 1, cursor: calling ? "not-allowed" : "pointer" }}>
            <span className="btn-icon">
              {calling ? <span style={{ fontSize: 16 }}>⏳</span> : <IconMMegaphone size={16} />}
            </span>
            <span>{calling ? "Chamando..." : callLabel}</span>
          </button>
        )}

        {showDirection && (
          <div style={{ position: "relative" }}>
            <button
              ref={dirBtnRef}
              className="action-btn-block btn-direct"
              onClick={(e) => {
                e.stopPropagation()
                const next = !showDirPopover
                if (next && dirBtnRef.current) {
                  const rect = dirBtnRef.current.getBoundingClientRect()
                  setDirPos({ top: rect.bottom + 2, left: Math.max(10, rect.right - 130), width: 0 })
                }
                setShowDirPopover(next)
              }}
            >
              <span className="btn-icon"><IconMRoundPushpin size={16} /></span>
              <span>{pet.localDirecionado || directionLabel}</span>
            </button>
            {showDirPopover && createPortal(
              <div ref={dirPopoverRef} className="direction-popover show" style={{
                position: "fixed", top: dirPos.top, left: dirPos.left,
                bottom: "auto", right: "auto",
                minWidth: 120, zIndex: 10000
              }}>
                {["GUICHÊ 1", "GUICHÊ 2", "Pronto Atendimento"].map(local => (
                  <div key={local} className="direction-opt" onClick={() => handleDirection(local)}>
                    {local}
                  </div>
                ))}
              </div>,
              document.body
            )}
          </div>
        )}

        {showFinish && (
          <button className="action-btn-block btn-finish" onClick={handleFinish}>
            <span className="btn-icon">✓</span>
            <span>Concluir</span>
          </button>
        )}
      </div>
    </div>
  )
}
