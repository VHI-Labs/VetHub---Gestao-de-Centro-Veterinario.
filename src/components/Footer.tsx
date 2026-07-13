import { motion } from "framer-motion"
import { PawPrint, Send, Github, Linkedin, Mail } from "lucide-react"

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
              Sistema de gestão veterinária desenvolvido por estudantes de NSI para transformar o atendimento em clínicas de todo o Brasil.
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
              links: [
                { label: "GitHub", href: "https://github.com/vihisantos" },
                { label: "Portfolio Vitor", href: "https://vihisantos.github.io/My.Portfolio/" },
                { label: "Portfolio Ingrid", href: "https://ingridbrito.dev" },
              ]
            },
          ].map((col) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="text-[#2d3a2d]/50 text-xs font-semibold uppercase tracking-widest mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link: { label: string; id?: string; href?: string }) => (
                  <li key={link.label}>
                    <motion.button
                      whileHover={{ x: 3 }}
                      onClick={() => {
                        if ("id" in link && link.id) scrollTo(link.id)
                        else if ("href" in link && link.href) window.open(link.href, "_blank")
                      }}
                      className="text-[#2d3a2d]/30 hover:text-[#2d3a2d]/60 text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </motion.button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative z-10 border-t border-black/5 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#2d3a2d]/25 text-xs text-center sm:text-left">
            &copy; {new Date().getFullYear()} VetHub. Feito com dedicação por{" "}
            <a href="https://vihisantos.github.io/My.Portfolio/" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-[#2d3a2d]/50 transition-colors">Vitor Santos</a>
            {" "}&{" "}
            <a href="https://ingridbrito.dev" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-[#2d3a2d]/50 transition-colors">Ingrid Brito</a>.
          </p>
          <p className="text-[#2d3a2d]/15 text-[11px] tracking-widest">v 1.0.0</p>
          <div className="flex items-center gap-4">
            {[Github, Linkedin, Mail].map((Icon, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ y: -2, scale: 1.1 }}
                className="transition-colors"
                style={{ color: "rgba(45,58,45,0.2)" }}
              >
                <Icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
