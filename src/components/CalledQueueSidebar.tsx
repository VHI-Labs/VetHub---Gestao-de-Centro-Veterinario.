import { supabase } from "../lib/supabase"
import { useQueueStore } from "../store/queueStore"
import { updatePetStatus, reCallPet } from "../core/engine"
import { useWaitTimer } from "../hooks/useWaitTimer"
import type { Pet, Species } from "../types"
import { PawPrint, Bird, Megaphone, PhoneCall } from "lucide-react"

function CalledPetItem({ pet }: { pet: Pet }) {
  const waitLabel = useWaitTimer(pet.dataHora)
  const refresh = useQueueStore(s => s.refresh)

  const especieBadge = pet.especie === "Cão"
    ? { bg: "rgba(59,130,246,0.1)", color: "#2563eb" }
    : pet.especie === "Gato"
      ? { bg: "rgba(236,72,153,0.1)", color: "#db2777" }
      : { bg: "rgba(16,185,129,0.1)", color: "#059669" }

  const handleRecall = () => {
    setTimeout(async () => {
      await reCallPet(pet.id, pet.localDirecionado || "Triagem")
      await refresh()
    }, 3000)
  }

  const handleFinish = async () => {
    await supabase.from("call_history").delete().eq("pet_id", pet.id)
    await updatePetStatus(pet.id, pet.especie as Species, "Finalizado")
    await refresh()
  }

  return (
    <div className="called-queue-item">
      <div className="called-queue-main">
        <span className="called-queue-specie" style={{ background: especieBadge.bg, color: especieBadge.color }}>
          {pet.especie === "Cão" ? <PawPrint size={16} /> : pet.especie === "Gato" ? <PawPrint size={16} /> : <Bird size={16} />}
        </span>
        <div className="called-queue-info">
          <strong className="called-queue-senha">{pet.senha}</strong>
          <span className="called-queue-name">{pet.tipoAtendimento}</span>
          <span className="called-queue-wait">{waitLabel}</span>
        </div>
      </div>
      <div className="called-queue-actions">
        <button className="cq-btn cq-btn-recall" onClick={handleRecall} title="Rechamar">
          <Megaphone size={16} />
        </button>
        <button className="cq-btn cq-btn-finish" onClick={handleFinish} title="Concluir">
          ✓
        </button>
      </div>
    </div>
  )
}

interface Props {
  senhaPrefix?: string
}

export default function CalledQueueSidebar({ senhaPrefix }: Props) {
  const { dogs, cats, wild } = useQueueStore()

  const allPets = [...dogs, ...cats, ...wild]
  const calledPets = allPets.filter(
    p => p.status && !["Aguardando direcionamento", "Finalizado", "Atendido"].includes(p.status)
      && (!senhaPrefix || p.senha?.startsWith(senhaPrefix))
  )

  return (
    <aside className="called-queue-sidebar">
      <div className="called-queue-header">
        <span><PhoneCall size={14} /> Chamados</span>
        <span className="called-queue-count">{calledPets.length}</span>
      </div>
      <div className="called-queue-list">
        {calledPets.length === 0 ? (
          <div className="called-queue-empty">Nenhum paciente chamado</div>
        ) : (
          calledPets.map(pet => (
            <CalledPetItem key={pet.id} pet={pet} />
          ))
        )}
      </div>
    </aside>
  )
}
