import React, { useState, useRef, useEffect } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import { useCalendar } from '../../hooks/useCalendar'
import { formatShortDate } from '../../utils/dateUtils'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, highlightLoan } = useNotifications()
  const { returnLoan } = useCalendar()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleReturn(loanId: string) {
    await returnLoan(loanId)
    setOpen(false)
  }

  function handleOpenInCalendar(loanId: string) {
    highlightLoan(loanId)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-border)]"
        aria-label="Varsler"
      >
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {notifications.length > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ background: '#ef4444', color: '#fff' }}
          >
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 z-50 w-80 rounded-xl border shadow-xl"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="border-b px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Varsler
            </h3>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Ingen aktive varsler
            </div>
          ) : (
            <ul className="divide-y max-h-72 overflow-y-auto" style={{ borderColor: 'var(--color-border)' }}>
              {notifications.map((n) => (
                <li key={n.loanId} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {n.loanedTo}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Forfalt {n.daysOverdue} dag{n.daysOverdue !== 1 ? 'er' : ''} siden{' '}
                        {formatShortDate(n.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleReturn(n.loanId)}
                      className="text-xs"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      Marker som levert
                    </button>
                    <span style={{ color: 'var(--color-border)' }}>·</span>
                    <button
                      onClick={() => handleOpenInCalendar(n.loanId)}
                      className="text-xs"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Åpne i kalender
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
