import React, { useState } from 'react'
import type { ShootDay } from '../../../shared/types/calendar'
import { useCalendar } from '../../hooks/useCalendar'
import { useAppStore } from '../../store/appStore'
import { generateId } from '../../utils/markdownUtils'
import { today } from '../../utils/dateUtils'

interface ShootDayFormProps {
  initialDate?: string
  existingDay?: ShootDay
  onClose: () => void
}

export function ShootDayForm({ initialDate, existingDay, onClose }: ShootDayFormProps) {
  const { saveShootDay, deleteShootDay } = useCalendar()
  const { state } = useAppStore()
  const [form, setForm] = useState<Partial<ShootDay>>({
    date: existingDay?.date ?? initialDate ?? today(),
    title: existingDay?.title ?? '',
    location: existingDay?.location ?? '',
    crew: existingDay?.crew ?? '',
    projectId: existingDay?.projectId ?? '',
    equipmentIds: existingDay?.equipmentIds ?? [],
    notes: existingDay?.notes ?? '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const activeProjects = state.projects.filter((p) => p.status !== 'archived')
  const allEquipment = state.equipment

  async function handleSave() {
    if (!form.title?.trim()) { setError('Tittel er påkrevd.'); return }
    setSaving(true)
    setError('')
    const day: ShootDay = {
      id: existingDay?.id ?? generateId(),
      date: form.date!,
      title: form.title.trim(),
      location: form.location || undefined,
      crew: form.crew || undefined,
      projectId: form.projectId || undefined,
      equipmentIds: form.equipmentIds ?? [],
      notes: form.notes || undefined,
    }
    const result = await saveShootDay(day)
    setSaving(false)
    if (result.success) onClose()
    else setError(result.error ?? 'Kunne ikke lagre shoot-dag.')
  }

  async function handleDelete() {
    if (!existingDay) return
    await deleteShootDay(existingDay.id)
    onClose()
  }

  function toggleEquipment(id: string) {
    const ids = form.equipmentIds ?? []
    setForm({
      ...form,
      equipmentIds: ids.includes(id) ? ids.filter((e) => e !== id) : [...ids, id],
    })
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded px-3 py-2 text-xs" style={{ background: 'rgba(220,38,38,0.1)', color: '#ef4444' }}>{error}</div>}
      <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-base w-full" />
      <input value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tittel" className="input-base w-full" />
      <input value={form.location ?? ''} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Lokasjon (valgfritt)" className="input-base w-full" />
      <input value={form.crew ?? ''} onChange={(e) => setForm({ ...form, crew: e.target.value })} placeholder="Crew — Navn, Navn, Navn (valgfritt)" className="input-base w-full" />
      <select value={form.projectId ?? ''} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="input-base w-full">
        <option value="">Tilknyttet prosjekt (valgfritt)</option>
        {activeProjects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
      </select>

      {allEquipment.length > 0 && (
        <div>
          <p className="mb-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>Utstyr (valgfritt)</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {allEquipment.map((eq) => (
              <label key={eq.id} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-text)' }}>
                <input
                  type="checkbox"
                  checked={(form.equipmentIds ?? []).includes(eq.id)}
                  onChange={() => toggleEquipment(eq.id)}
                  style={{ accentColor: 'var(--color-accent)' }}
                />
                {eq.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <textarea value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Notater (valgfritt)" className="input-base w-full resize-none" />

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm">{saving ? 'Lagrer…' : (existingDay ? 'Lagre' : 'Opprett')}</button>
        {existingDay && !confirmDelete && (
          <button onClick={() => setConfirmDelete(true)} className="btn-secondary text-sm" style={{ color: '#ef4444' }}>Slett</button>
        )}
        {confirmDelete && (
          <button onClick={handleDelete} className="btn-primary text-sm" style={{ background: '#ef4444' }}>Bekreft sletting</button>
        )}
        <button onClick={onClose} className="btn-secondary text-sm">Avbryt</button>
      </div>
    </div>
  )
}
