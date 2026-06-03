import React, { useState, useEffect } from 'react'
import type { Equipment } from '../../../shared/types/equipment'
import { EquipmentCard } from './EquipmentCard'
import { EquipmentDetail } from './EquipmentDetail'
import { useEquipment } from '../../hooks/useEquipment'
import { useAppStore } from '../../store/appStore'
import { generateId } from '../../utils/markdownUtils'

export function EquipmentList() {
  const { equipment, refresh, saveEquipment } = useEquipment()
  const { state } = useAppStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<Partial<Equipment>>({ status: 'available', category: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => { if (state.config?.vaultPath) refresh() }, [state.config?.vaultPath])

  const categories = [...new Set(equipment.map((e) => e.category).filter(Boolean))]

  const visible = equipment.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCategory && e.category !== filterCategory) return false
    if (filterStatus && e.status !== filterStatus) return false
    return true
  })

  const selected = equipment.find((e) => e.id === selectedId) ?? null

  async function handleCreate() {
    if (!form.name?.trim()) { setFormError('Navn er påkrevd.'); return }
    if (!form.category?.trim()) { setFormError('Kategori er påkrevd.'); return }
    const owners = state.config?.owners ?? []
    if (owners.length === 0) { setFormError('Legg til minst én eier i Innstillinger først.'); return }

    setSaving(true)
    const eq: Equipment = {
      id: generateId(),
      name: form.name.trim(),
      category: form.category.trim(),
      ownerId: form.ownerId ?? owners[0]?.id ?? '',
      serialNumber: form.serialNumber,
      purchasePrice: form.purchasePrice !== undefined ? Math.max(0, form.purchasePrice) : undefined,
      status: form.status ?? 'available',
      notes: form.notes,
      createdAt: new Date().toISOString(),
    }
    await saveEquipment(eq)
    setSelectedId(eq.id)
    setCreating(false)
    setForm({ status: 'available', category: '' })
    setSaving(false)
    setFormError('')
  }

  async function handleExportPdf() {
    await window.electronAPI.exportEquipmentPdf()
  }

  const owners = state.config?.owners ?? []

  return (
    <div className="flex h-full">
      <div className="flex w-72 flex-col border-r" style={{ borderColor: 'var(--color-border)' }}>
        {/* Filters */}
        <div className="space-y-2 border-b px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Søk utstyr…"
              className="input-base flex-1 text-sm"
            />
            <button onClick={() => setCreating(true)} className="btn-primary text-xs py-1 px-2">+ Nytt</button>
          </div>
          <div className="flex gap-2">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-base flex-1 text-xs">
              <option value="">Alle kategorier</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-base flex-1 text-xs">
              <option value="">Alle statuser</option>
              <option value="available">Tilgjengelig</option>
              <option value="on-loan">Utlånt</option>
              <option value="in-service">Til service</option>
              <option value="retired">Pensjonert</option>
            </select>
          </div>
          <button onClick={handleExportPdf} className="btn-secondary w-full text-xs">Eksporter liste (PDF)</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {visible.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {owners.length === 0 ? 'Legg til en eier i Innstillinger først.' : 'Ingen utstyr funnet.'}
              </p>
            </div>
          )}
          {visible.map((eq) => (
            <EquipmentCard key={eq.id} equipment={eq} selected={eq.id === selectedId} onClick={() => setSelectedId(eq.id)} />
          ))}
        </div>

        {creating && (
          <div className="border-t p-4 space-y-2" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Nytt utstyr</h3>
            {formError && <p className="text-xs" style={{ color: '#ef4444' }}>{formError}</p>}
            <input value={form.name ?? ''} onChange={(e) => { setForm({ ...form, name: e.target.value }); setFormError('') }} placeholder="Navn" className="input-base w-full text-sm" />
            <input value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Kategori" className="input-base w-full text-sm" />
            <select value={form.ownerId ?? ''} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} className="input-base w-full text-sm">
              <option value="">Velg eier</option>
              {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <input value={form.serialNumber ?? ''} onChange={(e) => setForm({ ...form, serialNumber: e.target.value || undefined })} placeholder="Serienummer" className="input-base w-full text-sm" />
            <input type="number" min={0} value={form.purchasePrice ?? ''} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value ? Number(e.target.value) : undefined })} placeholder="Innkjøpspris" className="input-base w-full text-sm" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Equipment['status'] })} className="input-base w-full text-sm">
              <option value="available">Tilgjengelig</option>
              <option value="in-service">Til service</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={saving} className="btn-primary flex-1 text-sm">{saving ? 'Oppretter…' : 'Opprett'}</button>
              <button onClick={() => { setCreating(false); setFormError('') }} className="btn-secondary text-sm">Avbryt</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {selected ? (
          <EquipmentDetail key={selected.id} equipment={selected} onDeleted={() => setSelectedId(null)} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Velg utstyr for å se detaljer</p>
          </div>
        )}
      </div>
    </div>
  )
}
