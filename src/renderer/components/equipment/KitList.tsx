import React, { useState, useEffect } from 'react'
import type { Kit } from '../../../shared/types/kit'
import { useKits } from '../../hooks/useKits'
import { useAppStore } from '../../store/appStore'
import { useEquipment } from '../../hooks/useEquipment'
import { generateId } from '../../utils/markdownUtils'

export function KitList() {
  const { kits, refresh, saveKit, deleteKit } = useKits()
  const { equipment, refresh: refreshEquipment } = useEquipment()
  const { state } = useAppStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<Partial<Kit>>({ equipmentIds: [], shotType: '' })
  const [editForm, setEditForm] = useState<Kit | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (state.config?.vaultPath) { refresh(); refreshEquipment() }
  }, [state.config?.vaultPath])

  const selected = kits.find((k) => k.id === selectedId) ?? null

  function toggleEquipment(form: Partial<Kit>, id: string): string[] {
    const ids = form.equipmentIds ?? []
    return ids.includes(id) ? ids.filter((e) => e !== id) : [...ids, id]
  }

  async function handleCreate() {
    if (!form.name?.trim()) { setFormError('Navn er påkrevd.'); return }
    if (!form.shotType?.trim()) { setFormError('Shot-type er påkrevd.'); return }
    setSaving(true)
    const kit: Kit = {
      id: generateId(),
      name: form.name.trim(),
      description: form.description,
      shotType: form.shotType.trim(),
      equipmentIds: form.equipmentIds ?? [],
      notes: form.notes,
    }
    await saveKit(kit)
    setSelectedId(kit.id)
    setCreating(false)
    setForm({ equipmentIds: [], shotType: '' })
    setSaving(false)
    setFormError('')
  }

  async function handleSaveEdit() {
    if (!editForm) return
    setSaving(true)
    await saveKit(editForm)
    setSaving(false)
    setEditForm(null)
  }

  async function handleDelete(id: string) {
    await deleteKit(id)
    if (selectedId === id) setSelectedId(null)
    setConfirmDeleteId(null)
  }

  return (
    <div className="flex h-full">
      {/* Kit list */}
      <div className="flex w-64 flex-col border-r" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Kits</h3>
          <button onClick={() => setCreating(true)} className="btn-primary text-xs py-1 px-2">+ Nytt</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {kits.length === 0 && !creating && (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen kits ennå.</p>
            </div>
          )}
          {kits.map((kit) => (
            <button
              key={kit.id}
              onClick={() => { setSelectedId(kit.id); setEditForm(null) }}
              className={[
                'w-full rounded-lg border px-4 py-3 text-left transition-all',
                selectedId === kit.id ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]',
              ].join(' ')}
              style={{ background: 'var(--color-surface)' }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{kit.name}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{kit.shotType} · {kit.equipmentIds.length} utstyr</p>
            </button>
          ))}
        </div>

        {creating && (
          <div className="border-t p-4 space-y-2" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Nytt kit</h3>
            {formError && <p className="text-xs" style={{ color: '#ef4444' }}>{formError}</p>}
            <input value={form.name ?? ''} onChange={(e) => { setForm({ ...form, name: e.target.value }); setFormError('') }} placeholder="Navn" className="input-base w-full text-sm" />
            <input value={form.shotType ?? ''} onChange={(e) => setForm({ ...form, shotType: e.target.value })} placeholder="Shot-type" className="input-base w-full text-sm" />
            <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Beskrivelse" rows={2} className="input-base w-full resize-none text-sm" />
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={saving} className="btn-primary flex-1 text-sm">{saving ? 'Oppretter…' : 'Opprett'}</button>
              <button onClick={() => { setCreating(false); setFormError('') }} className="btn-secondary text-sm">Avbryt</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>{selected.name}</h2>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{selected.shotType}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditForm(editForm ? null : { ...selected })} className="btn-secondary text-sm">
                  {editForm ? 'Avbryt' : 'Rediger'}
                </button>
                {confirmDeleteId === selected.id ? (
                  <button onClick={() => handleDelete(selected.id)} className="btn-primary text-sm" style={{ background: '#ef4444' }}>Bekreft sletting</button>
                ) : (
                  <button onClick={() => setConfirmDeleteId(selected.id)} className="btn-secondary text-sm" style={{ color: '#ef4444' }}>Slett</button>
                )}
              </div>
            </div>

            {editForm && editForm.id === selected.id ? (
              <div className="space-y-3">
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-base w-full" placeholder="Navn" />
                <input value={editForm.shotType} onChange={(e) => setEditForm({ ...editForm, shotType: e.target.value })} className="input-base w-full" placeholder="Shot-type" />
                <textarea value={editForm.description ?? ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} className="input-base w-full resize-none" placeholder="Beskrivelse" />
                <div>
                  <p className="mb-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>Utstyr i kit</p>
                  {equipment.map((eq) => (
                    <label key={eq.id} className="flex items-center gap-2 py-0.5 text-sm cursor-pointer" style={{ color: 'var(--color-text)' }}>
                      <input type="checkbox" checked={editForm.equipmentIds.includes(eq.id)} onChange={() => setEditForm({ ...editForm, equipmentIds: toggleEquipment(editForm, eq.id) })} style={{ accentColor: 'var(--color-accent)' }} />
                      {eq.name}
                    </label>
                  ))}
                </div>
                <textarea value={editForm.notes ?? ''} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={2} className="input-base w-full resize-none" placeholder="Notater" />
                <button onClick={handleSaveEdit} disabled={saving} className="btn-primary text-sm">{saving ? 'Lagrer…' : 'Lagre'}</button>
              </div>
            ) : (
              <div>
                {selected.description && <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{selected.description}</p>}
                <h3 className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Utstyr</h3>
                {selected.equipmentIds.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen utstyr i dette kittet.</p>
                ) : (
                  <ul className="space-y-2">
                    {selected.equipmentIds.map((id) => {
                      const eq = equipment.find((e) => e.id === id)
                      if (!eq) return null
                      const available = eq.status === 'available'
                      return (
                        <li key={id} className="flex items-center gap-3 rounded-lg border px-4 py-2" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ background: available ? '#4ade80' : '#6b7280' }}
                          />
                          <span className="text-sm" style={{ color: available ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{eq.name}</span>
                          {!available && <span className="ml-auto text-xs" style={{ color: 'var(--color-text-muted)' }}>Utilgjengelig</span>}
                        </li>
                      )
                    })}
                  </ul>
                )}
                {selected.notes && <p className="mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>{selected.notes}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Velg et kit for å se detaljer</p>
          </div>
        )}
      </div>
    </div>
  )
}
