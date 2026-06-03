import React from 'react'
import type { Loan, Equipment } from '../../../shared/types/equipment'
import { useCalendar } from '../../hooks/useCalendar'
import { formatShortDate } from '../../utils/dateUtils'

interface LoanOverlayProps {
  loans: Loan[]
  equipment: Equipment[]
}

export function LoanOverlay({ loans, equipment }: LoanOverlayProps) {
  const { returnLoan } = useCalendar()

  if (loans.length === 0) return null

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Utlån</p>
      <ul className="space-y-2">
        {loans.map((loan) => {
          const eq = equipment.find((e) => e.id === loan.equipmentId)
          return (
            <li key={loan.id} className="rounded-lg border px-3 py-2" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{eq?.name ?? 'Ukjent utstyr'}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Utlånt til {loan.loanedTo}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatShortDate(loan.startDate)} – {formatShortDate(loan.endDate)}</p>
              <button onClick={() => returnLoan(loan.id)} className="mt-1 text-xs" style={{ color: '#f59e0b' }}>Marker levert</button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
