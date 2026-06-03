import React from 'react'
import { THEMES } from '../../../shared/constants'

const THEME_LABELS: Record<string, string> = {
  'nordic-slate': 'Nordic Slate',
  'soft-dusk': 'Soft Dusk',
  'tokyo-night': 'Tokyo Night',
  'paper-ink': 'Paper & Ink',
  'lavender-fog': 'Lavender Fog',
  'iron-press': 'Iron Press',
}

const THEME_DESCRIPTIONS: Record<string, string> = {
  'nordic-slate': 'Mørk — kjølig nordisk palett',
  'soft-dusk': 'Mørk — myke lilla toner',
  'tokyo-night': 'Mørk — klar blå Tokyo-estetikk',
  'paper-ink': 'Lys — varmt papir og blekk',
  'lavender-fog': 'Lys — duse lavendeltoner',
  'iron-press': 'Lys — skarp rød aksent på grå',
}

interface ThemePickerProps {
  selected: string
  onSelect: (theme: string) => void
}

export function ThemePicker({ selected, onSelect }: ThemePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {THEMES.map((theme) => (
        <button
          key={theme}
          onClick={() => onSelect(theme)}
          className={[
            'rounded-lg border-2 p-4 text-left transition-all',
            selected === theme
              ? 'border-[var(--color-accent)]'
              : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]',
          ].join(' ')}
          style={{ background: 'var(--color-surface)' }}
        >
          {/* Mini colour swatches */}
          <div className="mb-3 flex gap-1.5">
            <ThemeSwatch theme={theme} role="bg" />
            <ThemeSwatch theme={theme} role="surface" />
            <ThemeSwatch theme={theme} role="accent" />
          </div>
          <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {THEME_LABELS[theme]}
          </div>
          <div className="mt-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {THEME_DESCRIPTIONS[theme]}
          </div>
        </button>
      ))}
    </div>
  )
}

const THEME_COLOURS: Record<string, Record<string, string>> = {
  'nordic-slate': { bg: '#1e2327', surface: '#252b30', accent: '#89c4cf' },
  'soft-dusk': { bg: '#1e1a24', surface: '#252030', accent: '#c9a0b4' },
  'tokyo-night': { bg: '#1a1b2e', surface: '#1f2040', accent: '#7aa2f7' },
  'paper-ink': { bg: '#f5f0e8', surface: '#ede8e0', accent: '#3d3530' },
  'lavender-fog': { bg: '#f0edf5', surface: '#e8e3f0', accent: '#7c5cbf' },
  'iron-press': { bg: '#f2f0ed', surface: '#eae8e4', accent: '#c0392b' },
}

function ThemeSwatch({ theme, role }: { theme: string; role: 'bg' | 'surface' | 'accent' }) {
  const colour = THEME_COLOURS[theme]?.[role] ?? '#888'
  return (
    <span
      className="h-4 w-4 rounded-full border border-black/10"
      style={{ background: colour }}
    />
  )
}
