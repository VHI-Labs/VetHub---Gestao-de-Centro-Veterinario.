import { motion } from "framer-motion"
import { PawPrint, Send, Mail } from "lucide-react"

function GithubIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={{ ...style, fill: style?.color || "currentColor" }} viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}

function LinkedinIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={{ ...style, fill: style?.color || "currentColor" }} viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

export default function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <footer className="relative overflow-hidden" style={{ background: "#e8e6e0", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
      <style>{`
        @keyframes floatParticle {
          0% { transform: translateY(0) scale(1); opacity: 0.2; }
          100% { transform: translateY(-24px) scale(1.3); opacity: 0.4; }
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + (i % 2) * 2}px`,
              height: `${2 + (i % 2) * 2}px`,
              background: "rgba(107,142,107,0.2)",
              left: `${10 + i * 15}%`,
              top: `${20 + (i * 12) % 60}%`,
              animation: `floatParticle ${3 + i * 0.5}s ease-in-out ${i * 0.4}s infinite alternate`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(107,142,107,0.12)" }}>
                <PawPrint className="w-4 h-4" style={{ color: "#6b8e6b" }} />
              </div>
              <span className="text-[#2d3a2d] font-semibold text-sm">VetHub</span>
            </div>
            <p className="text-[#2d3a2d]/35 text-xs leading-relaxed mb-5">
              Sistema de gestão veterinária desenvolvido para tornar o atendimento mais simples, eficiente e transparente em clínicas de todo o Brasil.
            </p>
            <div>
              <p className="text-[#2d3a2d]/40 text-xs font-medium mb-2">Receba novidades</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Seu email"
                  className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: "rgba(107,142,107,0.06)", border: "1px solid rgba(107,142,107,0.1)", color: "#2d3a2d" }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 rounded-lg text-xs font-medium"
                  style={{ background: "#6b8e6b", color: "white" }}
                >
                  <Send className="w-3 h-3" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {[
            {
              title: "Produto",
              links: [
                { label: "Funcionalidades", id: "funcionalidades" },
                { label: "Como Funciona", id: "como-funciona" },
                { label: "Preços", id: "precos" },
                { label: "FAQ", id: "faq" },
              ]
            },
            {
              title: "Empresa",
              links: [
                { label: "Quem Somos", id: "quem-somos" },
                { label: "Contato", id: "contato" },
                { label: "Blog", href: "#" },
              ]
            },
            {
              title: "Redes",
              custom: true,
              content: (
                <div className="space-y-5">
                  {[
                    {
                      name: "Vitor Santos",
                      links: [
                        { icon: GithubIcon, href: "https://github.com/vihisantos", label: "GitHub" },
                        { icon: LinkedinIcon, href: "https://www.linkedin.com/in/vihisantos/", label: "LinkedIn" },
                      ]
                    },
                    {
                      name: "Ingrid Brito",
                      links: [
                        { icon: GithubIcon, href: "https://github.com/IngridBrito", label: "GitHub" },
                        { icon: LinkedinIcon, href: "https://www.linkedin.com/in/ingrid-brito-5957b2333/", label: "LinkedIn" },
                      ]
                    }
                  ].map(person => (
                    <div key={person.name}>
                      <p className="text-[#2d3a2d]/40 text-xs font-medium mb-2">{person.name}</p>
                      <div className="flex gap-2">
                        {person.links.map(link => (
                          <motion.a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -2, scale: 1.1 }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{ background: "rgba(107,142,107,0.06)", border: "1px solid rgba(107,142,107,0.08)" }}
                            title={link.label}
                          >
                            <link.icon className="w-3.5 h-3.5" style={{ color: "rgba(45,58,45,0.4)" }} />
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            },
          ].map((col: { title: string; links?: { label: string; id?: string; href?: string }[]; custom?: boolean; content?: React.ReactNode }) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="text-[#2d3a2d]/50 text-xs font-semibold uppercase tracking-widest mb-4">{col.title}</h4>
              {col.custom ? col.content : (
                <ul className="space-y-3">
                  {col.links?.map((link) => (
                    <li key={link.label}>
                      <motion.button
                        whileHover={{ x: 3 }}
                        onClick={() => {
                          if (link.id) scrollTo(link.id)
                          else if (link.href) window.open(link.href, "_blank")
                        }}
                        className="text-[#2d3a2d]/30 hover:text-[#2d3a2d]/60 text-sm transition-colors duration-200"
                      >
                        {link.label}
                      </motion.button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative z-10 border-t border-black/5 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#2d3a2d]/25 text-xs text-center sm:text-left flex items-center gap-1.5">
            &copy; {new Date().getFullYear()} VetHub. Todos os direitos reservados.
            <span className="inline-flex items-center ml-1">
              <svg width="16" height="11" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="14" rx="2" fill="#009739"/>
                <polygon points="10,1 19,7 10,13 1,7" fill="#FEDD00"/>
                <circle cx="10" cy="7" r="3.2" fill="#002776"/>
                <path d="M6.8 7.2 Q10 5.8 13.2 7.2" stroke="#FFFFFF" strokeWidth="0.7" fill="none"/>
              </svg>
            </span>
          </p>
          <p className="text-[#2d3a2d]/15 text-[11px] tracking-widest">v 1.0.0</p>
        </div>
      </div>
    </footer>
  )
}
