import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { ArrowLeft, Search, Shield } from "lucide-react"

interface AuditEntry {
  id: string
  tabela: string
  acao: string
  registro_id: string
  usuario_id: string | null
  usuario_email: string | null
  dados_anteriores: Record<string, unknown> | null
  dados_novos: Record<string, unknown> | null
  criado_em: string
}

const TABELAS = ["Todas", "owners", "patients", "consultas", "vacinas", "cirurgias", "exames", "agendamentos"]
const ACOES = ["Todas", "INSERT", "UPDATE", "DELETE"]

export default function AuditLog() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTabela, setFilterTabela] = useState("Todas")
  const [filterAcao, setFilterAcao] = useState("Todas")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setLoading(true)
    const q = supabase.from('audit_log').select('*').order('criado_em', { ascending: false }).limit(200)
    const { data, error } = await q
    if (error) {
      console.error('[AuditLog] load error:', error)
    } else {
      setLogs((data || []) as AuditEntry[])
    }
    setLoading(false)
  }

  const filtered = logs.filter(l => {
    if (filterTabela !== "Todas" && l.tabela !== filterTabela) return false
    if (filterAcao !== "Todas" && l.acao !== filterAcao) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      if (!l.registro_id.toLowerCase().includes(q) &&
          !(l.usuario_email || '').toLowerCase().includes(q) &&
          !l.tabela.toLowerCase().includes(q)) return false
    }
    return true
  })

  const acaoColor = (acao: string) => {
    if (acao === 'INSERT') return { bg: 'rgba(16,185,129,0.1)', color: '#059669' }
    if (acao === 'UPDATE') return { bg: 'rgba(59,130,246,0.1)', color: '#2563eb' }
    if (acao === 'DELETE') return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' }
    return { bg: 'rgba(245,158,11,0.1)', color: '#d97706' }
  }

  return (
    <div style={{ minHeight: "100vh", background: "rgba(15,23,42,0.95)" }}>
      <header style={{
        background: "rgba(15,23,42,0.85)", backdropFilter: "blur(12px)",
        color: "#fff", padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#e0e7e3" }}>VetHub AUDITORIA</span>
          <span style={{
            background: "rgba(16,185,129,0.15)", color: "#34d399",
            padding: "2px 10px", borderRadius: 8, fontSize: "0.7rem", fontWeight: 700,
            letterSpacing: "0.05em"
          }}>
            <Shield size={11} style={{ marginRight: 4, display: "inline" }} />
            SOMENTE ADMIN
          </span>
        </div>
        <button onClick={() => navigate('/admin')} style={{
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.7)", padding: "6px 14px", borderRadius: 8,
          cursor: "pointer", fontSize: "0.82rem", fontWeight: 500,
          display: "flex", alignItems: "center", gap: 6
        }}>
          <ArrowLeft size={14} /> Voltar ao Admin
        </button>
      </header>

      <main style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          background: "rgba(15,23,42,0.6)", backdropFilter: "blur(16px)",
          borderRadius: 16, padding: 24,
          border: "1px solid rgba(255,255,255,0.06)"
        }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por ID, tabela, email..."
                style={{
                  width: "100%", padding: "10px 12px 10px 36px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.85rem",
                  background: "rgba(255,255,255,0.05)", color: "#e0e7e3",
                  outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
            <select value={filterTabela} onChange={e => setFilterTabela(e.target.value)}
              style={{
                padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "0.85rem", background: "rgba(255,255,255,0.05)", color: "#e0e7e3",
                cursor: "pointer", outline: "none"
              }}>
              {TABELAS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterAcao} onChange={e => setFilterAcao(e.target.value)}
              style={{
                padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "0.85rem", background: "rgba(255,255,255,0.05)", color: "#e0e7e3",
                cursor: "pointer", outline: "none"
              }}>
              {ACOES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <button onClick={loadLogs} style={{
              padding: "10px 16px", borderRadius: 8, border: "1px solid rgba(16,185,129,0.3)",
              background: "rgba(16,185,129,0.1)", color: "#34d399", cursor: "pointer",
              fontSize: "0.85rem", fontWeight: 600
            }}>
              Atualizar
            </button>
            <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
              {filtered.length} registro(s)
            </span>
          </div>

          {loading ? (
            <div style={{ color: "rgba(255,255,255,0.4)", padding: "40px", textAlign: "center" }}>Carregando...</div>
          ) : filtered.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.3)", padding: "40px", textAlign: "center" }}>
              Nenhum registro de auditoria encontrado.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Data/Hora</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Tabela</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Ação</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Registro ID</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Usuário</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(l => {
                    const ac = acaoColor(l.acao)
                    return (
                      <tr key={l.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "10px 12px", color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap", fontFamily: "monospace", fontSize: "0.75rem" }}>
                          {new Date(l.criado_em).toLocaleString("pt-BR")}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#e0e7e3", fontWeight: 600 }}>{l.tabela}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{
                            padding: "2px 8px", borderRadius: 6, fontWeight: 600,
                            background: ac.bg, color: ac.color, fontSize: "0.75rem"
                          }}>
                            {l.acao}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", color: "rgba(255,255,255,0.5)", fontFamily: "monospace", fontSize: "0.75rem" }}>
                          {l.registro_id}
                        </td>
                        <td style={{ padding: "10px 12px", color: "rgba(255,255,255,0.6)", fontSize: "0.78rem" }}>
                          {l.usuario_email || "—"}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          {l.dados_novos && (
                            <span style={{ color: "#34d399", fontSize: "0.72rem", cursor: "pointer" }}
                              title={JSON.stringify(l.dados_novos, null, 2)}>
                              {Object.keys(l.dados_novos).length} campo(s)
                            </span>
                          )}
                          {l.dados_anteriores && l.acao === 'DELETE' && (
                            <span style={{ color: "#f87171", fontSize: "0.72rem", marginLeft: 8, cursor: "pointer" }}
                              title={JSON.stringify(l.dados_anteriores, null, 2)}>
                              {Object.keys(l.dados_anteriores).length} campo(s)
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
