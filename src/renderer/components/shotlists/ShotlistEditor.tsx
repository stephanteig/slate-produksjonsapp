import React, { useEffect, useRef, useState } from 'react'
import type { Shotlist, ShotSection as ShotSectionType } from '../../../shared/types/shotlist'
import { DEFAULT_SECTION_COLOR } from '../../../shared/constants'
import { useAppStore } from '../../store/appStore'
import { useShotlists } from '../../hooks/useShotlists'
import { today } from '../../utils/dateUtils'
import { ShotSection } from './ShotSection'
import { ShotlistPreview } from './ShotlistPreview'
import { ShotlistTemplates } from './ShotlistTemplates'
import { MoodboardPanel } from './MoodboardPanel'

interface Props {
  shotlist: Shotlist
  onDelete: () => void
}

function computeShotNumbers(sections: ShotSectionType[]): Map<string, number> {
  const map = new Map<string, number>()
  let n = 0
  for (const section of sections) {
    for (const row of section.rows) {
      if (row.type === 'shot') {
        n++
        map.set(row.id, n)
      }
    }
  }
  return map
}

export function ShotlistEditor({ shotlist, onDelete }: Props) {
  const { state } = useAppStore()
  const { saveShotlist } = useShotlists()
  const [draft, setDraft] = useState<Shotlist>(() => ({ ...shotlist, sections: shotlist.sections.map((s) => ({ ...s, rows: [...s.rows] })) }))
  const [showPreview, setShowPreview] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showMoodboard, setShowMoodboard] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [exporting, setExporting] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  // Reset draft when shotlist ID changes
  useEffect(() => {
    setDraft({ ...shotlist, sections: shotlist.sections.map((s) => ({ ...s, rows: [...s.rows] })) })
    isFirstRender.current = true
  }, [shotlist.id])

  // Debounced auto-save
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      saveShotlist({ ...draft, updatedAt: today() })
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [draft])

  const shotNumbers = computeShotNumbers(draft.sections)

  function updateSection(idx: number, updated: ShotSectionType) {
    const sections = [...draft.sections]
    sections[idx] = updated
    setDraft({ ...draft, sections })
  }

  function deleteSection(idx: number) {
    setDraft({ ...draft, sections: draft.sections.filter((_, i) => i !== idx) })
  }

  function addSection() {
    const colors = ['#4f8ef7', '#e06b74', '#98c379', '#e5c07b', '#c678dd', '#56b6c2', '#d19a66', '#abb2bf']
    const nextColor = colors[draft.sections.length % colors.length] ?? DEFAULT_SECTION_COLOR
    const newSection: ShotSectionType = {
      id: crypto.randomUUID(),
      name: '',
      color: nextColor,
      collapsed: false,
      rows: [],
    }
    setDraft({ ...draft, sections: [...draft.sections, newSection] })
  }

  function applyTemplate(sections: ShotSectionType[]) {
    setDraft({ ...draft, sections })
    setShowTemplates(false)
  }

  function addMoodboardImage(relativePath: string) {
    setDraft({ ...draft, moodboardImages: [...draft.moodboardImages, relativePath] })
  }

  function removeMoodboardImage(relativePath: string) {
    setDraft({ ...draft, moodboardImages: draft.moodboardImages.filter((p) => p !== relativePath) })
  }

  async function handleExportPdf() {
    setExporting(true)
    await window.electronAPI.exportShotlistPdf(draft.id)
    setExporting(false)
  }

  const activeProjects = state.projects.filter((p) => p.status !== 'archived')
  const activeShootDays = state.shootDays.filter((d) => {
    if (!draft.projectId) return true
    return d.projectId === draft.projectId || !d.projectId
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="border-b px-4 py-3 space-y-2 flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="Tittel på shotlist"
          className="w-full bg-transparent text-base font-semibold outline-none"
          style={{ color: 'var(--color-text)' }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={draft.projectId ?? ''}
            onChange={(e) => setDraft({ ...draft, projectId: e.target.value || undefined })}
            className="input-base text-xs py-0.5 flex-1 min-w-0"
          >
            <option value="">Prosjekt (valgfritt)</option>
            {activeProjects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <select
            value={draft.shootDayId ?? ''}
            onChange={(e) => setDraft({ ...draft, shootDayId: e.target.value || undefined })}
            className="input-base text-xs py-0.5 flex-1 min-w-0"
          >
            <option value="">Shoot-dag (valgfritt)</option>
            {activeShootDays.map((d) => <option key={d.id} value={d.id}>{d.date} — {d.title}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowMoodboard((v) => !v)} className="btn-secondary text-xs py-0.5 px-2">
            {showMoodboard ? 'Skjul moodboard' : 'Moodboard'}
            {draft.moodboardImages.length > 0 && (
              <span className="ml-1 text-[10px]" style={{ color: 'var(--color-accent)' }}>({draft.moodboardImages.length})</span>
            )}
          </button>
          <button onClick={() => setShowTemplates(true)} className="btn-secondary text-xs py-0.5 px-2">Maler</button>
          <button onClick={() => setShowPreview((v) => !v)} className="btn-secondary text-xs py-0.5 px-2">
            {showPreview ? 'Skjul forhåndsvisning' : 'Forhåndsvisning'}
          </button>
          <button onClick={handleExportPdf} disabled={exporting} className="btn-secondary text-xs py-0.5 px-2">
            {exporting ? 'Eksporterer…' : 'Eksporter PDF'}
          </button>
          <div className="flex-1" />
          {confirmDelete ? (
            <>
              <button onClick={onDelete} className="text-xs font-medium" style={{ color: '#ef4444' }}>Bekreft sletting</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Avbryt</button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Slett</button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor area */}
        <div className="flex-1 overflow-y-auto">
          {showMoodboard && (
            <MoodboardPanel
              shotlistId={draft.id}
              imagePaths={draft.moodboardImages}
              onAdd={addMoodboardImage}
              onRemove={removeMoodboardImage}
            />
          )}

          <div className="px-4 py-3">
            {draft.sections.map((section, idx) => (
              <ShotSection
                key={section.id}
                section={section}
                shotlistId={draft.id}
                shotNumbers={shotNumbers}
                onChange={(updated) => updateSection(idx, updated)}
                onDelete={() => deleteSection(idx)}
              />
            ))}

            <button
              onClick={addSection}
              className="mt-1 text-xs transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              + Ny scene
            </button>
          </div>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <ShotlistPreview shotlist={draft} onClose={() => setShowPreview(false)} />
        )}
      </div>

      {showTemplates && (
        <ShotlistTemplates
          onApply={applyTemplate}
          onClose={() => setShowTemplates(false)}
          hasExistingSections={draft.sections.length > 0}
        />
      )}
    </div>
  )
}
