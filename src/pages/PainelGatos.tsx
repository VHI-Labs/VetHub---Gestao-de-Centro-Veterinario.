import { useEffect } from "react"
import { useQueueStore } from "../store/queueStore"
import { useStorageSync } from "../hooks/useStorageSync"
import TvPanelLayout from "../components/TvPanelLayout"
import { PawPrint } from "lucide-react"

export default function PainelGatos() {
  useStorageSync()
  const { activeCallCat, activeCallWild, callHistoryCat, callHistoryWild, refresh } = useQueueStore()

  useEffect(() => { refresh() }, [])

  const activeCall = activeCallCat || activeCallWild
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
