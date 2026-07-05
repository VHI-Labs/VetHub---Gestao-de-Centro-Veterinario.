import { type ReactNode } from 'react'

interface TopbarTab {
  label: string
  onClick: () => void
  active: boolean
}

interface TopbarProps {
  title: string
  tabs?: TopbarTab[]
  children?: ReactNode
}

export default function Topbar({ title, tabs }: TopbarProps) {
  return (
    <div data-testid="topbar">
      <span>{title}</span>
      {tabs?.map((t: TopbarTab) => (
        <button key={t.label} onClick={t.onClick} data-active={t.active}>
          {t.label}
        </button>
      ))}
    </div>
  )
}
