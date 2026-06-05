import React, { useState, useEffect } from 'react'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns'
import { nb } from 'date-fns/locale'
import { useCalendar } from '../../hooks/useCalendar'
import { useAppStore } from '../../store/appStore'
import { ShootDayForm } from './ShootDayForm'
import { LoanOverlay } from './LoanOverlay'
import { toISODateString } from '../../utils/dateUtils'
import type { ShootDay } from '../../../shared/types/calendar'

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showShootForm, setShowShootForm] = useState(false)
  const [editingShootDay, setEditingShootDay] = useState<ShootDay | null>(null)
  const { shootDays, loans, refreshShootDays, refreshLoans } = useCalendar()
  const { state } = useAppStore()

  useEffect(() => {
    if (state.config?.vaultPath) {
      refreshShootDays()
      refreshLoans()
    }
  }, [state.config?.vaultPath])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startPad = getDay(monthStart)

  function getShootDaysForDate(dateStr: string) {
    return shootDays.filter((s) => s.date === dateStr)
  }

  function getLoansForDate(dateStr: string) {
    return loans.filter((l) => !l.returned && l.startDate <= dateStr && l.endDate >= dateStr)
  }

  function handleDayClick(dateStr: string) {
    setSelectedDate(dateStr === selectedDate ? null : dateStr)
    setShowShootForm(false)
    setEditingShootDay(null)
  }

  const selectedShootDays = selectedDate ? getShootDaysForDate(selectedDate) : []
  const selectedLoans = selectedDate ? getLoansForDate(selectedDate) : []
  const highlightedLoanId = state.highlightedLoanId

  return (
    <div className="flex h-full">
      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Month navigation */}
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="btn-secondary text-sm">‹</button>
          <h2 className="text-base font-semibold capitalize" style={{ color: 'var(--color-text)' }}>
            {format(currentDate, 'MMMM yyyy', { locale: nb })}
          </h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="btn-secondary text-sm">›</button>
        </div>

        {/* Weekday headers */}
        <div className="mb-1 grid grid-cols-7 gap-1 text-center">
          {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map((d) => (
            <div key={d} className="py-1 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Padding for month start (Monday = 0, but getDay gives 0=Sunday, so adjust) */}
          {Array.from({ length: (startPad + 6) % 7 }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const dateStr = toISODateString(day)
            const shoots = getShootDaysForDate(dateStr)
            const dayLoans = getLoansForDate(dateStr)
            const isSelected = selectedDate === dateStr
            const isToday = isSameDay(day, new Date())

            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(dateStr)}
                className={[
                  'relative min-h-[60px] rounded-lg border p-1.5 text-left transition-all',
                  isSelected ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]',
                  !isSameMonth(day, currentDate) ? 'opacity-40' : '',
                ].join(' ')}
                style={{ background: isSelected ? 'var(--color-surface)' : undefined }}
              >
                <span
                  className={[
                    'flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium',
                    isToday ? 'text-[var(--color-bg)]' : '',
                  ].join(' ')}
                  style={{
                    background: isToday ? 'var(--color-accent)' : undefined,
                    color: isToday ? 'var(--color-bg)' : 'var(--color-text)',
                  }}
                >
                  {format(day, 'd')}
                </span>
                <div className="mt-1 space-y-0.5">
                  {shoots.map((s) => (
                    <div
                      key={s.id}
                      className="truncate rounded px-1 text-[10px] font-medium"
                      style={{ background: 'var(--color-accent)22', color: 'var(--color-accent)' }}
                    >
                      {s.title}
                    </div>
                  ))}
                  {dayLoans.map((l) => {
                    const eq = state.equipment.find((e) => e.id === l.equipmentId)
                    const isHighlighted = l.id === highlightedLoanId
                    return (
                      <div
                        key={l.id}
                        className="truncate rounded px-1 text-[10px]"
                        style={{
                          background: isHighlighted ? 'rgba(245,158,11,0.4)' : 'rgba(245,158,11,0.15)',
                          color: '#f59e0b',
                          outline: isHighlighted ? '1px solid #f59e0b' : undefined,
                        }}
                      >
                        {eq?.name ?? l.loanedTo}
                      </div>
                    )
                  })}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div
        className="w-72 border-l overflow-y-auto p-4"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {selectedDate ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                {format(parseISO(selectedDate), 'd. MMMM', { locale: nb })}
              </h3>
              <button onClick={() => { setShowShootForm(true); setEditingShootDay(null) }} className="btn-primary text-xs py-1 px-2">
                + Shoot
              </button>
            </div>

            {showShootForm && !editingShootDay && (
              <ShootDayForm
                initialDate={selectedDate}
                onClose={() => { setShowShootForm(false); refreshShootDays() }}
              />
            )}

            {editingShootDay && (
              <ShootDayForm
                existingDay={editingShootDay}
                onClose={() => { setEditingShootDay(null); refreshShootDays() }}
              />
            )}

            {selectedShootDays.length === 0 && selectedLoans.length === 0 && !showShootForm && !editingShootDay && (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen hendelser denne dagen.</p>
            )}

            {!showShootForm && !editingShootDay && selectedShootDays.map((s) => (
              <div key={s.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>{s.title}</p>
                    {s.location && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>📍 {s.location}</p>}
                    {s.crew && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>👥 {s.crew}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => window.electronAPI.exportShootDayPdf(s.id)}
                      className="text-xs"
                      style={{ color: 'var(--color-text-muted)' }}
                      title="Eksporter PDF"
                    >
                      PDF
                    </button>
                    <button onClick={() => { setEditingShootDay(s); setShowShootForm(false) }} className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Rediger</button>
                  </div>
                </div>
              </div>
            ))}

            {selectedLoans.length > 0 && (
              <LoanOverlay loans={selectedLoans} equipment={state.equipment} />
            )}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Klikk på en dag for å se detaljer</p>
        )}
      </div>
    </div>
  )
}
