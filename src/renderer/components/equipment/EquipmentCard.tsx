import React from 'react'
import type { Equipment } from '../../../shared/types/equipment'
import { useAppStore } from '../../store/appStore'

const STATUS_LABELS: Record<Equipment['status'], string> = {
  available: 'Tilgjengelig',
  'on-loan': 'Utlånt',
  'in-service': 'Til service',
  retired: 'Pensjonert',
}

const STATUS_COLOURS: Record<Equipment['status'], string> = {
  available: '#4ade80',
  'on-loan': '#f59e0b',
  'in-service': '#6b7e8d',
  retired: '#374151',
}

interface EquipmentCardProps {
  equipment: Equipment
  selected: boolean
  onClick: () => void
}

export function EquipmentCard({ equipment, selected, onClick }: EquipmentCardProps) {
  const { state } = useAppStore()
  const owner = state.config?.owners.find((o) => o.id === equipment.ownerId)

  return (
    <button
      onClick={onClick}
      className={[
        'w-full rounded-lg border px-4 py-3 text-left transition-all',
        selected
          ? 'border-[var(--color-accent)]'
          : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]',
      ].join(' ')}
      style={{ background: 'var(--color-surface)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {equipment.name}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {equipment.category}{owner ? ` · ${owner.name}` : ''}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            background: STATUS_COLOURS[equipment.status] + '22',
            color: STATUS_COLOURS[equipment.status],
          }}
        >
          {STATUS_LABELS[equipment.status]}
        </span>
      </div>
    </button>
  )
}
