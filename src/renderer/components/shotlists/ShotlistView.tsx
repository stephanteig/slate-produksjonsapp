import React, { useState } from 'react'
import type { Shotlist } from '../../../shared/types/shotlist'
import { useShotlists } from '../../hooks/useShotlists'
import { useAppStore } from '../../store/appStore'
import { today } from '../../utils/dateUtils'
import { ShotlistEditor } from './ShotlistEditor'

function newShotlist(): Shotlist {
  return {
    id: crypto.randomUUID(),
    title: '',
    moodboardImages: [],
    createdAt: today(),
    updatedAt: today(),
    sections: [],
  }
}

export function ShotlistView() {
  const { shotlists, saveShotlist, deleteShotlist } = useShotlists()
  const { state } = useAppStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [filterProjectId, setFilterProjectId] = useState<string>('')

  const activeShotlist = shotlists.find((s) => s.id === activeId) ?? null

  async function handleNew() {
    const sl = newShotlist()
    await saveShotlist(sl)
    setActiveId(sl.id)
  }

  async function handleDelete() {
    if (!activeId) return
    await deleteShotlist(activeId)
    setActiveId(null)
  }

  const filteredShotlists = filterProjectId
    ? shotlists.filter((s) => s.projectId === filterProjectId)
    : shotlists

  const activeProjects = state.projects.filter((p) => p.status !== 'archived')

  function projectName(id?: string) {
    if (!id) return null
    return state.projects.find((p) => p.id === id)?.title ?? null
  }

  function shotCount(sl: Shotlist) {
    return sl.sections.flatMap((s) => s.rows).filter((r) => r.type === 'shot').length
  }

  return (
    <div className="flex h-full">
      {/* Left: shotlist list */}
      <div
        className="w-56 flex-shrink-0 flex flex-col border-r"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
      >
        <div className="border-b p-3 space-y-2" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Shotlister</h2>
            <button onClick={handleNew} className="btn-primary text-xs py-0.5 px-2">+ Ny</button>
          </div>
          {activeProjects.length > 0 && (
            <select
              value={filterProjectId}
              onChange={(e) => setFilterProjectId(e.target.value)}
              className="input-base w-full text-xs py-0.5"
            >
              <option value="">Alle prosjekter</option>
              {activeProjects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {filteredShotlists.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {filterProjectId ? 'Ingen shotlister for dette prosjektet.' : 'Ingen shotlister ennå.'}
              </p>
            </div>
          ) : (
            filteredShotlists.map((sl) => {
              const active = sl.id === activeId
              const proj = projectName(sl.projectId)
              const shots = shotCount(sl)
              return (
                <button
                  key={sl.id}
                  onClick={() => setActiveId(sl.id)}
                  className="w-full text-left px-3 py-2 transition-colors"
                  style={{
                    background: active ? 'var(--color-bg)' : undefined,
                    borderLeft: active ? `2px solid var(--color-accent)` : '2px solid transparent',
                  }}
                >
                  <p className="text-xs font-medium truncate" style={{ color: active ? 'var(--color-accent)' : 'var(--color-text)' }}>
                    {sl.title || '(uten tittel)'}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    {shots} shot{shots !== 1 ? 's' : ''}
                    {proj ? ` · ${proj}` : ''}
                  </p>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right: editor or empty state */}
      <div className="flex-1 overflow-hidden" style={{ background: 'var(--color-bg)' }}>
        {activeShotlist ? (
          <ShotlistEditor
            key={activeShotlist.id}
            shotlist={activeShotlist}
            onDelete={handleDelete}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Velg en shotlist eller opprett en ny.
            </p>
            <button onClick={handleNew} className="btn-primary text-sm">+ Ny shotlist</button>
          </div>
        )}
      </div>
    </div>
  )
}
