import React, { useState, useEffect } from 'react'
import type { Project } from '../../../shared/types/project'
import { TaskList } from './TaskList'
import { useProjects } from '../../hooks/useProjects'
import { isValidDropboxUrl } from '../../utils/validationUtils'

interface ProjectDetailProps {
  project: Project
  onArchive: () => void
}

const STATUS_OPTIONS: { value: Project['status']; label: string }[] = [
  { value: 'planning', label: 'Planlegging' },
  { value: 'in-progress', label: 'Pågår' },
  { value: 'delivered', label: 'Levert' },
]

export function ProjectDetail({ project, onArchive }: ProjectDetailProps) {
  const { saveProject, saveTasks } = useProjects()
  const [title, setTitle] = useState(project.title)
  const [status, setStatus] = useState(project.status)
  const [dropboxUrl, setDropboxUrl] = useState(project.dropboxUrl ?? '')
  const [tasks, setTasks] = useState(project.tasks)
  const [editing, setEditing] = useState(false)
  const [titleError, setTitleError] = useState('')
  const [dropboxWarning, setDropboxWarning] = useState('')
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTitle(project.title)
    setStatus(project.status)
    setDropboxUrl(project.dropboxUrl ?? '')
    setTasks(project.tasks)
    setEditing(false)
  }, [project.id])

  async function handleSave() {
    if (!title.trim()) {
      setTitleError('Prosjektnavn kan ikke være tomt.')
      return
    }
    if (dropboxUrl && !isValidDropboxUrl(dropboxUrl)) {
      setDropboxWarning('URL ser ikke ut til å starte med https://')
    } else {
      setDropboxWarning('')
    }

    setSaving(true)
    await saveProject({ ...project, title: title.trim(), status, dropboxUrl: dropboxUrl || undefined, tasks })
    setSaving(false)
    setEditing(false)
    setTitleError('')
  }

  async function handleTasksChange(newTasks: typeof tasks) {
    setTasks(newTasks)
    await saveTasks(project.id, newTasks)
  }

  async function handleArchive() {
    await saveProject({ ...project, status: 'archived', tasks })
    onArchive()
    setConfirmArchive(false)
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          {editing ? (
            <div className="space-y-3">
              <div>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setTitleError('') }}
                  className="input-base w-full text-lg font-semibold"
                />
                {titleError && (
                  <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{titleError}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Project['status'])}
                  className="input-base"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  value={dropboxUrl}
                  onChange={(e) => setDropboxUrl(e.target.value)}
                  placeholder="Dropbox URL (valgfritt)"
                  className="input-base w-full text-sm"
                />
                {dropboxWarning && (
                  <p className="mt-1 text-xs" style={{ color: '#eab308' }}>{dropboxWarning}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                  {saving ? 'Lagrer…' : 'Lagre'}
                </button>
                <button onClick={() => { setEditing(false); setTitle(project.title); setStatus(project.status) }} className="btn-secondary text-sm">
                  Avbryt
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                {project.title}
              </h1>
              {dropboxUrl && (
                <a
                  href={dropboxUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 text-xs hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Dropbox ↗
                </a>
              )}
            </div>
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
              Rediger
            </button>
            {project.status !== 'archived' && (
              <button
                onClick={() => setConfirmArchive(true)}
                className="btn-secondary text-sm"
                style={{ color: '#ef4444' }}
              >
                Arkiver
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirm archive */}
      {confirmArchive && (
        <div
          className="mb-6 rounded-lg border p-4"
          style={{
            background: 'rgba(220,38,38,0.06)',
            borderColor: 'rgba(220,38,38,0.2)',
          }}
        >
          <p className="mb-3 text-sm" style={{ color: 'var(--color-text)' }}>
            Er du sikker på at du vil arkivere «{project.title}»?
          </p>
          <div className="flex gap-2">
            <button onClick={handleArchive} className="btn-primary text-sm" style={{ background: '#ef4444' }}>
              Arkiver
            </button>
            <button onClick={() => setConfirmArchive(false)} className="btn-secondary text-sm">
              Avbryt
            </button>
          </div>
        </div>
      )}

      {/* Tasks */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          Oppgaver
        </h2>
        <TaskList tasks={tasks} onChange={handleTasksChange} />
      </div>
    </div>
  )
}
