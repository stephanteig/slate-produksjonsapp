import React from 'react'
import { ThemePicker } from '../onboarding/ThemePicker'
import { useTheme } from '../../hooks/useTheme'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Tema</h3>
      <ThemePicker selected={theme} onSelect={setTheme} />
    </div>
  )
}
