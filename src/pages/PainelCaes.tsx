import { useEffect } from "react"
import { useQueueStore } from "../store/queueStore"
import TvPanelLayout from "../components/TvPanelLayout"
import { PawPrint } from "lucide-react"

export default function PainelCaes() {
  const { activeCallDog, callHistoryDog, refresh } = useQueueStore()

  useEffect(() => { refresh() }, [])

  return (
    <TvPanelLayout
      activeCall={activeCallDog}
      history={callHistoryDog}
      title="Cães"
      icon={<PawPrint size={28} />}
    />
  )
}
