import { useEffect } from "react"
import { useQueueStore } from "../store/queueStore"
import TvPanelLayout from "../components/TvPanelLayout"
import { PawPrint } from "lucide-react"

export default function PainelGatos() {
  const { activeCallCat, activeCallWild, callHistoryCat, callHistoryWild, refresh } = useQueueStore()

  useEffect(() => { refresh() }, [])

  const activeCall = activeCallCat && activeCallWild
    ? (new Date(activeCallCat.calledAt || 0).getTime() > new Date(activeCallWild.calledAt || 0).getTime()
      ? activeCallCat : activeCallWild)
    : (activeCallCat || activeCallWild)
  const mergedHistory = [...callHistoryCat, ...callHistoryWild].sort(
    (a, b) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime()
  )

  return (
    <TvPanelLayout
      activeCall={activeCall}
      history={mergedHistory}
      title="Gatos e Silvestres"
      icon={<PawPrint size={28} />}
    />
  )
}
