import React from 'react'

interface MainPanelProps {
  children: React.ReactNode
}

export function MainPanel({ children }: MainPanelProps) {
  return (
    <div
      className="flex-1 overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      {children}
    </div>
  )
}
