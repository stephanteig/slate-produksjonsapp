import React, { useState, useEffect } from 'react'
import type { Project } from '../../../shared/types/project'
import { ProjectCard } from './ProjectCard'
import { ProjectDetail } from './ProjectDetail'
import { useProjects } from '../../hooks/useProjects'
import { useAppStore } from '../../store/appStore'
import { generateId } from '../../utils/markdownUtils'

export function ProjectList() {
  const { projects, refresh, saveProject } = useProjects()
  const { state } = useAppStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newStatus, setNewStatus] = useState<Project['status']>('planning')
  const [newDropbox, setNewDropbox] = useState('')
  const [titleError, setTitleError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (state.config?.vaultPath) refresh()
  }, [state.config?.vaultPath])

  const visible = projects.filter((p) =>
    showArchived ? true : p.status !== 'archived'
  )

  const selected = projects.find((p) => p.id === selectedId) ?? null

  async function handleCreate() {
    if (!newTitle.trim()) {
      setTitleError('Prosjektnavn kan ikke være tomt.')
      return
    }
    setSaving(true)
    const project: Project = {
      id: generateId(),
      title: newTitle.trim(),
      status: newStatus,
      dropboxUrl: newDropbox || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [],
      tags: ['slate', 'project'],
    }
    await saveProject(project)
    setSelectedId(project.id)
    setCreating(false)
    setNewTitle('')
    setNewDropbox('')
    setNewStatus('planning')
    setSaving(false)
    setTitleError('')
  }

  return (
    <div className="flex h-full">
      {/* Project list sidebar */}
      <div
        className="flex w-64 flex-col border-r"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {showArchived ? 'Skjul arkiverte' : 'Vis arkiverte'}
          </button>
          <button
            onClick={() => setCreating(true)}
            className="btn-primary text-xs py-1 px-2"
          >
            + Nytt
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {visible.length === 0 && !creating && (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Ingen prosjekter ennå.
              </p>
              <button
                onClick={() => setCreating(true)}
                className="mt-2 text-sm hover:underline"
                style={{ color: 'var(--color-accent)' }}
              >
                Opprett ditt første prosjekt
              </button>
            </div>
          )}
          {visible.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              selected={p.id === selectedId}
              onClick={() => setSelectedId(p.id)}
            />
          ))}
        </div>

        {/* Create form */}
        {creating && (
          <div
            className="border-t p-4 space-y-3"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Nytt prosjekt
            </h3>
            <div>
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => { setNewTitle(e.target.value); setTitleError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Prosjektnavn"
                className="input-base w-full text-sm"
              />
              {titleError && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{titleError}</p>}
            </div>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as Project['status'])}
              className="input-base w-full text-sm"
            >
              <option value="planning">Planlegging</option>
              <option value="in-progress">Pågår</option>
              <option value="delivered">Levert</option>
            </select>
            <input
              value={newDropbox}
              onChange={(e) => setNewDropbox(e.target.value)}
              placeholder="Dropbox URL (valgfritt)"
              className="input-base w-full text-sm"
            />
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={saving} className="btn-primary flex-1 text-sm">
                {saving ? 'Oppretter…' : 'Opprett'}
              </button>
              <button onClick={() => { setCreating(false); setTitleError('') }} className="btn-secondary text-sm">
                Avbryt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-hidden">
        {selected ? (
          <ProjectDetail
            key={selected.id}
            project={selected}
            onArchive={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Velg et prosjekt for å se detaljer
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
