import React from 'react'

export function SlateStripe() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: '48px',
        flexShrink: 0,
        background: `repeating-linear-gradient(
          -45deg,
          var(--color-surface) 0px,
          var(--color-surface) 22px,
          color-mix(in srgb, var(--color-border) 75%, transparent) 22px,
          color-mix(in srgb, var(--color-border) 75%, transparent) 26px
        )`,
        WebkitAppRegion: 'drag',
      } as React.CSSProperties}
    />
  )
}
