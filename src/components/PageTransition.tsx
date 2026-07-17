import { motion } from "framer-motion"
import { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export default function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
      animate={{
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
      }}
      exit={{
        opacity: 0,
        scale: 1.04,
        filter: "blur(6px)",
        transition: { duration: 0.3, ease: [0.55, 0, 1, 0.45] },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
