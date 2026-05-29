import { useState } from "react"
import type { Pet, Species } from "../types"
import { supabase } from "../lib/supabase"
import { updatePetStatus } from "../core/engine"
import { useWaitTimer } from "../hooks/useWaitTimer"
import { useQueueStore } from "../store/queueStore"
import { PawPrint, Bird, MapPin } from "lucide-react"

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
  const waitLabel = useWaitTimer(pet.dataHora)
  const refresh = useQueueStore(s => s.refresh)

  const especieBadge = pet.especie === "Cão"
    ? { bg: "rgba(59,130,246,0.1)", color: "#2563eb", icon: <PawPrint size={14} />, label: "Cão" }
    : pet.especie === "Gato"
      ? { bg: "rgba(236,72,153,0.1)", color: "#db2777", icon: <PawPrint size={14} />, label: "Gato" }
      : { bg: "rgba(16,185,129,0.1)", color: "#059669", icon: <Bird size={14} />, label: "Silvestres" }

  const handleCall = () => {
    setTimeout(async () => {
      await updatePetStatus(pet.id, pet.especie as Species, "Chamado", callLabel)
      await refresh()
    }, 3000)
  }

  const handleDirection = async (local: string) => {
    await updatePetStatus(pet.id, pet.especie as Species, "Direcionado", local)
    setShowDirPopover(false)
    await refresh()
  }

  const handleFinish = async () => {
    await supabase.from("call_history").delete().eq("pet_id", pet.id)
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
          <button className="action-btn-block btn-call" onClick={handleCall}>
            <span className="btn-icon"><img src="/emojis/megaphone.png" style={{ width: 16, height: 16 }} alt="📣" /></span>
            <span>{callLabel}</span>
          </button>
        )}

        {showDirection && (
          <div style={{ position: "relative" }}>
            <button
              className="action-btn-block btn-direct"
              onClick={(e) => { e.stopPropagation(); setShowDirPopover(!showDirPopover) }}
            >
              <span className="btn-icon"><MapPin size={16} /></span>
              <span>{pet.localDirecionado || directionLabel}</span>
            </button>
            <div className={`direction-popover ${showDirPopover ? "show" : ""}`}
              style={{ bottom: "calc(100% + 5px)", right: 0, minWidth: 140 }}>
              {["GUICHÊ 1", "GUICHÊ 2", "Triagem"].map(local => (
                <div key={local} className="direction-opt" onClick={() => handleDirection(local)}>
                  {local}
                </div>
              ))}
            </div>
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
