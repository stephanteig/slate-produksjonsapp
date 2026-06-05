import React from 'react'
import { NotificationBell } from './NotificationBell'
import { useAppStore } from '../../store/appStore'

const VIEW_TITLES: Record<string, string> = {
  projects: 'Prosjekter',
  equipment: 'Utstyr',
  calendar: 'Kalender',
  kits: 'Kits',
  settings: 'Innstillinger',
}

export function TopBar() {
  const { state } = useAppStore()
  const title = VIEW_TITLES[state.view] ?? 'Slate'

  return (
    <div
      className="flex h-12 items-center justify-between border-b px-4"
      style={{
        background: `repeating-linear-gradient(
          -45deg,
          var(--color-surface) 0px,
          var(--color-surface) 44px,
          color-mix(in srgb, var(--color-border) 45%, transparent) 44px,
          color-mix(in srgb, var(--color-border) 45%, transparent) 88px
        )`,
        borderColor: 'var(--color-border)',
        WebkitAppRegion: 'drag',
      } as React.CSSProperties}
    >
      <h2
        className="text-sm font-semibold"
        style={{ color: 'var(--color-text)', WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {title}
      </h2>
      <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <NotificationBell />
      </div>
    </div>
  )
}
