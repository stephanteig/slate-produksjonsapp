import React, { useState } from 'react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import type { ShotSection as ShotSectionType, ShotRow as ShotRowType } from '../../../shared/types/shotlist'
import { SECTION_COLORS } from '../../../shared/constants'
import { ShotRow } from './ShotRow'

interface Props {
  section: ShotSectionType
  shotlistId: string
  shotNumbers: Map<string, number>
  onChange: (updated: ShotSectionType) => void
  onDelete: () => void
}

export function ShotSection({ section, shotlistId, shotNumbers, onChange, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  function cycleColor() {
    const colors = [...SECTION_COLORS]
    const idx = colors.indexOf(section.color as typeof SECTION_COLORS[number])
    const next = colors[(idx + 1) % colors.length]
    onChange({ ...section, color: next })
  }

  function toggleCollapse() {
    onChange({ ...section, collapsed: !section.collapsed })
  }

  function addRow(type: ShotRowType['type'], afterId?: string) {
    const newRow: ShotRowType = {
      id: crypto.randomUUID(),
      type,
      text: '',
      checked: false,
    }
    if (afterId) {
      const idx = section.rows.findIndex((r) => r.id === afterId)
      const updated = [...section.rows]
      updated.splice(idx + 1, 0, newRow)
      onChange({ ...section, rows: updated })
    } else {
      onChange({ ...section, rows: [...section.rows, newRow] })
    }
  }

  function updateRow(rowId: string, updated: ShotRowType) {
    onChange({ ...section, rows: section.rows.map((r) => (r.id === rowId ? updated : r)) })
  }

  function deleteRow(rowId: string) {
    onChange({ ...section, rows: section.rows.filter((r) => r.id !== rowId) })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = section.rows.findIndex((r) => r.id === active.id)
    const newIndex = section.rows.findIndex((r) => r.id === over.id)
    onChange({ ...section, rows: arrayMove(section.rows, oldIndex, newIndex) })
  }

  const shotCount = section.rows.filter((r) => r.type === 'shot').length

  return (
    <div className="group/section rounded-lg border mb-3" style={{ borderColor: 'var(--color-border)' }}>
      {/* Section header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-lg"
        style={{ background: `${section.color}18`, borderBottom: `1px solid var(--color-border)` }}
      >
        <button
          onClick={cycleColor}
          className="w-3 h-3 rounded-full flex-shrink-0 transition-transform hover:scale-125"
          style={{ background: section.color }}
          title="Bytt farge"
        />
        <input
          value={section.name}
          onChange={(e) => onChange({ ...section, name: e.target.value })}
          placeholder="Navnløs scene"
          className="flex-1 bg-transparent text-xs font-semibold outline-none"
          style={{ color: 'var(--color-text)' }}
        />
        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{shotCount} shots</span>
        <button
          onClick={toggleCollapse}
          className="text-xs"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {section.collapsed ? '▶' : '▼'}
        </button>
        {confirmDelete ? (
          <div className="flex gap-1 items-center">
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              Slett {section.rows.length} rader?
            </span>
            <button onClick={onDelete} className="text-[10px] font-medium" style={{ color: '#ef4444' }}>Slett</button>
            <button onClick={() => setConfirmDelete(false)} className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Avbryt</button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="opacity-0 group-hover/section:opacity-60 text-[10px] transition-opacity"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Slett seksjon
          </button>
        )}
      </div>

      {/* Rows */}
      {!section.collapsed && (
        <div className="px-3 py-1">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={section.rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              {section.rows.map((row) => (
                <ShotRow
                  key={row.id}
                  row={row}
                  shotlistId={shotlistId}
                  shotNumber={shotNumbers.get(row.id)}
                  onChange={(updated) => updateRow(row.id, updated)}
                  onDelete={() => deleteRow(row.id)}
                  onAddBelow={(type) => addRow(type, row.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add row buttons */}
          <div className="flex gap-2 pt-1 pb-1">
            <button onClick={() => addRow('shot')} className="text-[10px] transition-opacity" style={{ color: 'var(--color-text-muted)' }}>
              + Shot
            </button>
            <button onClick={() => addRow('note')} className="text-[10px] transition-opacity" style={{ color: 'var(--color-text-muted)' }}>
              + Notat
            </button>
            <button onClick={() => addRow('quote')} className="text-[10px] transition-opacity" style={{ color: 'var(--color-text-muted)' }}>
              + Sitat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
