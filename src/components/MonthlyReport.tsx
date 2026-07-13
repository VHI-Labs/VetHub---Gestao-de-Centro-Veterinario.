import { useState } from "react"
import { getMonthlyReport } from "../core/engine"
import { useAuth } from "../context/AuthContext"
import { X, FileText } from "lucide-react"
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import IconMPawPrints from "react-fluentui-emoji/lib/modern/icons/IconMPawPrints"
import IconMDogFace from "react-fluentui-emoji/lib/modern/icons/IconMDogFace"
import IconMCatFace from "react-fluentui-emoji/lib/modern/icons/IconMCatFace"
import IconMBird from "react-fluentui-emoji/lib/modern/icons/IconMBird"
import type { Pet } from "../types"

interface ReportRow {
  especie: string
  total: number
  esperaMediaMin: number
  finalizados: number
  atendimentoMedioMin: number
}

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
const UNIDADES = ["Todos", "Unidade Central", "Unidade Norte", "Unidade Sul"]

function calcMinutos(d1: string, d2: string): number {
  return Math.round((new Date(d2).getTime() - new Date(d1).getTime()) / 60000)
}

export default function MonthlyReport({ onClose }: { onClose: () => void }) {
  const { unidade, role } = useAuth()
  const hoje = new Date()
  const [year, setYear] = useState(hoje.getFullYear())
  const [month, setMonth] = useState(hoje.getMonth())
  const [reportUnidade, setReportUnidade] = useState(unidade === "Todos" ? "" : unidade)
  const [data, setData] = useState<ReportRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [totalGeral, setTotalGeral] = useState(0)

  const gerar = async () => {
    setLoading(true)
    const u = reportUnidade === "Todos" ? "" : reportUnidade
    const pets = await getMonthlyReport(year, month, u)
    setTotalGeral(pets.length)

    const especies = ["Cão", "Gato", "Animais Silvestres"] as const
    const rows: ReportRow[] = especies.map(especie => {
      const filtrados = pets.filter(p => p.especie === especie)
      const comChamada = filtrados.filter(p => p.calledAt)
      const finalizados = filtrados.filter(p => p.finalizedAt)

      const esperaMedia = comChamada.length > 0
        ? Math.round(comChamada.reduce((acc, p) => acc + calcMinutos(p.dataHora, p.calledAt!), 0) / comChamada.length)
        : 0

      const atendimentoMedia = finalizados.length > 0
        ? Math.round(finalizados.reduce((acc, p) => acc + calcMinutos(p.dataHora, p.finalizedAt!), 0) / finalizados.length)
        : 0

      return {
        especie,
        total: filtrados.length,
        esperaMediaMin: esperaMedia,
        finalizados: finalizados.length,
        atendimentoMedioMin: atendimentoMedia
      }
    })

    setData(rows)
    setLoading(false)
  }

  const exportCSV = () => {
    if (!data) return
    const header = "Espécie,Total,Espera Média (min),Finalizados,Atendimento Médio (min)"
    const rows = data.map(r => `${r.especie},${r.total},${r.esperaMediaMin},${r.finalizados},${r.atendimentoMedioMin}`)
    const total = `TOTAL,${totalGeral},,,`
    const csv = [header, ...rows, total].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-vethub-${MESES[month]}-${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = () => {
    if (!data) return
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('VetHub - Relatório Mensal', 14, 22)
    doc.setFontSize(11)
    doc.text(`${MESES[month]} de ${year} — ${reportUnidade || 'Todas as Unidades'}`, 14, 30)
    doc.text(`Total de pacientes: ${totalGeral}`, 14, 36)

    const tableData = data.map(r => [
      r.especie,
      String(r.total),
      r.esperaMediaMin > 0 ? `${r.esperaMediaMin} min` : '—',
      String(r.finalizados),
      r.atendimentoMedioMin > 0 ? `${r.atendimentoMedioMin} min` : '—'
    ])

    ;(doc as any).autoTable({
      startY: 42,
      head: [['Espécie', 'Total', 'Espera Média', 'Finalizados', 'Atendimento Médio']],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [45, 58, 45] },
      margin: { left: 14 }
    })

    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text('* Espera média: tempo entre cadastro e chamada. Atendimento médio: tempo entre cadastro e finalização.', 14, doc.internal.pageSize.height - 10)

    doc.save(`relatorio-vethub-${MESES[month]}-${year}.pdf`)
  }

  const icone = (especie: string) =>
    especie === "Cão" ? <IconMDogFace size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> : especie === "Gato" ? <IconMCatFace size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> : <IconMBird size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 640,
        maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={24} color="#2d3a2d" />
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2d3a2d", margin: 0 }}>Relatório Mensal</h2>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af"
          }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{
              padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb",
              fontSize: "0.9rem", fontWeight: 600, background: "#fff", cursor: "pointer"
            }}
          >
            {Array.from({ length: 5 }, (_, i) => hoje.getFullYear() - 2 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            style={{
              padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb",
              fontSize: "0.9rem", fontWeight: 600, background: "#fff", cursor: "pointer"
            }}
          >
            {MESES.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>

          <select
            value={reportUnidade}
            onChange={e => setReportUnidade(e.target.value)}
            style={{
              padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb",
              fontSize: "0.9rem", fontWeight: 600, background: "#fff", cursor: "pointer"
            }}
          >
            <option value="Todos">Todas as Unidades</option>
            {UNIDADES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button onClick={gerar} disabled={loading} style={{
            padding: "10px 24px", border: "none", borderRadius: 8, cursor: "pointer",
            fontWeight: 600, fontSize: "0.9rem", background: "#2d3a2d", color: "#fff",
            opacity: loading ? 0.6 : 1
          }}>
            {loading ? "Gerando..." : "Gerar"}
          </button>
        </div>

        {data && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={exportCSV} style={{
              padding: "8px 16px", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer",
              fontWeight: 600, fontSize: "0.82rem", background: "#fff", color: "#374151",
              display: "flex", alignItems: "center", gap: 6
            }}>
              📥 CSV
            </button>
            <button onClick={exportPDF} style={{
              padding: "8px 16px", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer",
              fontWeight: 600, fontSize: "0.82rem", background: "#fff", color: "#374151",
              display: "flex", alignItems: "center", gap: 6
            }}>
              📄 PDF
            </button>
          </div>
        )}

        {data && (
          <>
            <div style={{ marginBottom: 16, fontSize: "1rem", color: "#2d3a2d", fontWeight: 600 }}>
              {MESES[month]} de {year} — {totalGeral} paciente(s)
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontSize: "0.8rem", textTransform: "uppercase" }}>
                  <th style={{ textAlign: "left", padding: "10px 8px" }}>Espécie</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>Total</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>Espera Média</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>Finalizados</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>Atendimento Médio</th>
                </tr>
              </thead>
              <tbody>
                {data.map(row => (
                  <tr key={row.especie} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 8px", fontWeight: 600, color: "#2d3a2d" }}>
                      {icone(row.especie)} {row.especie}
                    </td>
                    <td style={{ textAlign: "center", padding: "12px 8px", fontWeight: 700, fontSize: "1.1rem" }}>
                      {row.total}
                    </td>
                    <td style={{ textAlign: "center", padding: "12px 8px" }}>
                      {row.esperaMediaMin > 0 ? `${row.esperaMediaMin} min` : "—"}
                    </td>
                    <td style={{ textAlign: "center", padding: "12px 8px" }}>
                      {row.finalizados}
                    </td>
                    <td style={{ textAlign: "center", padding: "12px 8px" }}>
                      {row.atendimentoMedioMin > 0 ? `${row.atendimentoMedioMin} min` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 16, fontSize: "0.8rem", color: "#9ca3af", textAlign: "center" }}>
              * Espera média: tempo entre cadastro e chamada. Atendimento médio: tempo entre cadastro e finalização.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
