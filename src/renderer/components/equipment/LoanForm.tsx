import React, { useState } from 'react'
import type { Equipment } from '../../../shared/types/equipment'
import type { Loan } from '../../../shared/types/equipment'
import { useCalendar } from '../../hooks/useCalendar'
import { useAppStore } from '../../store/appStore'
import { generateId } from '../../utils/markdownUtils'
import { today } from '../../utils/dateUtils'

interface LoanFormProps {
  equipment: Equipment
  onClose: () => void
}

export function LoanForm({ equipment, onClose }: LoanFormProps) {
  const { state } = useAppStore()
  const { saveLoan } = useCalendar()
  const [loanedTo, setLoanedTo] = useState('')
  const [startDate, setStartDate] = useState(today())
  const [endDate, setEndDate] = useState('')
  const [projectId, setProjectId] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!loanedTo.trim()) { setError('Navn på låntaker er påkrevd.'); return }
    if (!endDate) { setError('Sluttdato er påkrevd.'); return }
    if (endDate < startDate) { setError('Sluttdato kan ikke være før startdato.'); return }

    setSaving(true)
    setError('')
    const loan: Loan = {
      id: generateId(),
      equipmentId: equipment.id,
      loanedTo: loanedTo.trim(),
      startDate,
      endDate,
      returned: false,
      projectId: projectId || undefined,
      notes: notes || undefined,
    }
    const result = await saveLoan(loan)
    setSaving(false)
    if (result.success) {
      onClose()
    } else {
      setError(result.error ?? 'Kunne ikke lagre utlån.')
    }
  }

  return (
    <div
      className="rounded-xl border p-5 space-y-4"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
        Registrer utlån — {equipment.name}
      </h3>

      {error && (
        <div className="rounded px-3 py-2 text-xs" style={{ background: 'rgba(220,38,38,0.1)', color: '#ef4444' }}>
          {error}
        </div>
      )}

      <div className="space-y-3">
        <input
          value={loanedTo}
          onChange={(e) => setLoanedTo(e.target.value)}
          placeholder="Låntakers navn"
          className="input-base w-full text-sm"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs" style={{ color: 'var(--color-text-muted)' }}>Startdato</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-base w-full text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs" style={{ color: 'var(--color-text-muted)' }}>Sluttdato</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-base w-full text-sm" />
          </div>
        </div>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="input-base w-full text-sm"
        >
          <option value="">Tilknyttet prosjekt (valgfritt)</option>
          {state.projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notater (valgfritt)"
          rows={2}
          className="input-base w-full text-sm resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1 text-sm">
          {saving ? 'Lagrer…' : 'Registrer utlån'}
        </button>
        <button onClick={onClose} className="btn-secondary text-sm">Avbryt</button>
      </div>
    </div>
  )
}
