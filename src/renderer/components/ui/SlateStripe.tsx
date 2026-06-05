import React from 'react'

export function SlateStripe() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: '8px',
        flexShrink: 0,
        background: `repeating-linear-gradient(
          -45deg,
          var(--stripe-a) 0px,
          var(--stripe-a) 8px,
          var(--stripe-b) 8px,
          var(--stripe-b) 16px
        )`,
        WebkitAppRegion: 'drag',
      } as React.CSSProperties}
    />
  )
}
