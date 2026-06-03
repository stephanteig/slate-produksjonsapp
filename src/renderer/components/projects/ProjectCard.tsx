import React from 'react'
import type { Project } from '../../../shared/types/project'

const STATUS_LABELS: Record<Project['status'], string> = {
  planning: 'Planlegging',
  'in-progress': 'Pågår',
  delivered: 'Levert',
  archived: 'Arkivert',
}

const STATUS_COLOURS: Record<Project['status'], string> = {
  planning: '#6b7e8d',
  'in-progress': '#89c4cf',
  delivered: '#4ade80',
  archived: '#374151',
}

interface ProjectCardProps {
  project: Project
  selected: boolean
  onClick: () => void
}

export function ProjectCard({ project, selected, onClick }: ProjectCardProps) {
  const done = project.tasks.filter((t) => t.completed).length
  const total = project.tasks.length

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
        <span
          className="text-sm font-medium leading-tight"
          style={{ color: 'var(--color-text)' }}
        >
          {project.title}
        </span>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            background: STATUS_COLOURS[project.status] + '22',
            color: STATUS_COLOURS[project.status],
          }}
        >
          {STATUS_LABELS[project.status]}
        </span>
      </div>
      {total > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <div
            className="h-1 flex-1 rounded-full overflow-hidden"
            style={{ background: 'var(--color-border)' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(done / total) * 100}%`,
                background: 'var(--color-accent)',
              }}
            />
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {done}/{total}
          </span>
        </div>
      )}
    </button>
  )
}
