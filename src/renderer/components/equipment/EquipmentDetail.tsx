import React, { useState, useEffect } from 'react'
import type { Equipment } from '../../../shared/types/equipment'
import { useEquipment } from '../../hooks/useEquipment'
import { useCalendar } from '../../hooks/useCalendar'
import { useAppStore } from '../../store/appStore'
import { LoanForm } from './LoanForm'
import { formatShortDate } from '../../utils/dateUtils'

interface EquipmentDetailProps {
  equipment: Equipment
  onDeleted: () => void
}

const STATUS_OPTIONS: { value: Equipment['status']; label: string }[] = [
  { value: 'available', label: 'Tilgjengelig' },
  { value: 'on-loan', label: 'Utlånt' },
  { value: 'in-service', label: 'Til service' },
  { value: 'retired', label: 'Pensjonert' },
]

export function EquipmentDetail({ equipment, onDeleted }: EquipmentDetailProps) {
  const { saveEquipment, deleteEquipment } = useEquipment()
  const { loans, refreshLoans, returnLoan } = useCalendar()
  const { state } = useAppStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...equipment })
  const [showLoanForm, setShowLoanForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({ ...equipment })
    setEditing(false)
    refreshLoans()
  }, [equipment.id])

  const activeLoans = loans.filter((l) => l.equipmentId === equipment.id && !l.returned)
  const pastLoans = loans.filter((l) => l.equipmentId === equipment.id && l.returned)
  const owner = state.config?.owners.find((o) => o.id === equipment.ownerId)

  async function handleSave() {
    const price = form.purchasePrice
    const cleaned = { ...form, purchasePrice: price !== undefined ? Math.max(0, price) : undefined }
    setSaving(true)
    await saveEquipment(cleaned)
    setSaving(false)
    setEditing(false)
  }

  async function handleDelete() {
    const result = await deleteEquipment(equipment.id)
    if (!result.success) {
      setError(result.error ?? 'Kan ikke slette utstyret.')
      setConfirmDelete(false)
    } else {
      onDeleted()
    }
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        {editing ? (
          <div className="flex-1 space-y-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-base w-full text-lg font-semibold" placeholder="Navn" />
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-base w-full text-sm" placeholder="Kategori" />
            <select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} className="input-base w-full text-sm">
              <option value="">Velg eier</option>
              {(state.config?.owners ?? []).map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            <input value={form.serialNumber ?? ''} onChange={(e) => setForm({ ...form, serialNumber: e.target.value || undefined })} className="input-base w-full text-sm" placeholder="Serienummer (valgfritt)" />
            <input type="number" min={0} value={form.purchasePrice ?? ''} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value ? Number(e.target.value) : undefined })} className="input-base w-full text-sm" placeholder="Innkjøpspris (valgfritt)" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Equipment['status'] })} className="input-base w-full text-sm">
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <textarea value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value || undefined })} rows={3} className="input-base w-full resize-none text-sm" placeholder="Notater" />
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? 'Lagrer…' : 'Lagre'}</button>
              <button onClick={() => { setEditing(false); setForm({ ...equipment }) }} className="btn-secondary text-sm">Avbryt</button>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>{equipment.name}</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {equipment.category} · {owner?.name ?? 'Ukjent eier'}
              {equipment.serialNumber ? ` · S/N: ${equipment.serialNumber}` : ''}
              {equipment.purchasePrice !== undefined ? ` · kr ${equipment.purchasePrice.toLocaleString('nb-NO')}` : ''}
            </p>
            {equipment.notes && (
              <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>{equipment.notes}</p>
            )}
          </div>
        )}

        {!editing && (
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">Rediger</button>
            <button onClick={() => setShowLoanForm((v) => !v)} className="btn-primary text-sm">
              {showLoanForm ? 'Lukk' : 'Lån ut'}
            </button>
            <button onClick={() => setConfirmDelete(true)} className="btn-secondary text-sm" style={{ color: '#ef4444' }}>Slett</button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded px-3 py-2 text-sm" style={{ background: 'rgba(220,38,38,0.1)', color: '#ef4444' }}>{error}</div>
      )}

      {confirmDelete && (
        <div className="mb-6 rounded-lg border p-4" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'rgba(220,38,38,0.2)' }}>
          <p className="mb-3 text-sm" style={{ color: 'var(--color-text)' }}>
            Slett «{equipment.name}» permanent?
          </p>
          <div className="flex gap-2">
            <button onClick={handleDelete} className="btn-primary text-sm" style={{ background: '#ef4444' }}>Slett</button>
            <button onClick={() => setConfirmDelete(false)} className="btn-secondary text-sm">Avbryt</button>
          </div>
        </div>
      )}

      {showLoanForm && <div className="mb-6"><LoanForm equipment={equipment} onClose={() => { setShowLoanForm(false); refreshLoans() }} /></div>}

      {/* Active loans */}
      {activeLoans.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Aktive utlån</h2>
          <ul className="space-y-2">
            {activeLoans.map((loan) => (
              <li key={loan.id} className="flex items-center justify-between rounded-lg border px-4 py-2" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{loan.loanedTo}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatShortDate(loan.startDate)} – {formatShortDate(loan.endDate)}</p>
                </div>
                <button onClick={() => returnLoan(loan.id)} className="text-xs" style={{ color: 'var(--color-accent)' }}>Marker levert</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Past loans */}
      {pastLoans.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Tidligere utlån</h2>
          <ul className="space-y-2">
            {pastLoans.map((loan) => (
              <li key={loan.id} className="rounded-lg border px-4 py-2" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{loan.loanedTo} · {formatShortDate(loan.startDate)} – {formatShortDate(loan.endDate)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
