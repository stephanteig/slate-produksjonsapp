import React from 'react'
import type { Shotlist } from '../../../shared/types/shotlist'

interface Props {
  shotlist: Shotlist
  onClose: () => void
}

export function ShotlistPreview({ shotlist, onClose }: Props) {
  const allRows = shotlist.sections.flatMap((s) => s.rows)
  const totalShots = allRows.filter((r) => r.type === 'shot').length
  const doneShots = allRows.filter((r) => r.type === 'shot' && r.checked).length
  const pct = totalShots > 0 ? Math.round((doneShots / totalShots) * 100) : 0
  const estMin = totalShots * 3

  let shotNum = 0
  const lines: string[] = []
  for (const section of shotlist.sections) {
    lines.push(`\n── ${section.name} ──`)
    for (const row of section.rows) {
      if (row.type === 'shot') {
        shotNum++
        lines.push(`${String(shotNum).padStart(2, '0')}. [${row.checked ? '✓' : ' '}] ${row.text}`)
        if (row.shotSize || row.lens || row.movement) {
          const det = [row.shotSize, row.lens, row.movement].filter(Boolean).join(' · ')
          lines.push(`    ${det}`)
        }
      } else if (row.type === 'note') {
        lines.push(`    📝 ${row.text}`)
      } else {
        lines.push(`    «${row.text}»`)
      }
    }
  }
  const text = lines.join('\n').trim()

  async function copyText() {
    await navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col h-full border-l" style={{ borderColor: 'var(--color-border)', minWidth: 280 }}>
      <div className="flex items-center justify-between border-b px-4 py-2" style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>Forhåndsvisning</span>
        <button onClick={onClose} className="text-xs" style={{ color: 'var(--color-text-muted)' }}>✕</button>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto flex-1">
        {/* Stats */}
        <div className="rounded-lg p-3 space-y-2" style={{ background: 'var(--color-bg)' }}>
          <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Shots fullført</span>
            <span style={{ color: 'var(--color-text)' }}>{doneShots}/{totalShots} ({pct}%)</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'var(--color-border)' }}>
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${pct}%`, background: 'var(--color-accent)' }}
            />
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Est. tid: ~{estMin} min
          </p>
        </div>

        {/* Plain text */}
        <pre
          className="text-xs rounded-lg p-3 whitespace-pre-wrap font-mono overflow-x-hidden"
          style={{ background: 'var(--color-bg)', color: 'var(--color-text)', lineHeight: 1.6 }}
        >
          {text || '(tom shotlist)'}
        </pre>

        <button onClick={copyText} className="btn-secondary w-full text-xs">
          Kopier til utklippstavle
        </button>
      </div>
    </div>
  )
}
