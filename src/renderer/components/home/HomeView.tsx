import React from 'react'
import { addDays } from 'date-fns'
import { useAppStore } from '../../store/appStore'
import { useCalendar } from '../../hooks/useCalendar'
import { formatDisplayDate, formatShortDate, toISODateString, today } from '../../utils/dateUtils'
import type { Shotlist } from '../../../shared/types/shotlist'

function shotCount(sl: Shotlist) {
  return sl.sections.flatMap((s) => s.rows).filter((r) => r.type === 'shot').length
}

export function HomeView() {
  const { state, dispatch } = useAppStore()
  const { returnLoan } = useCalendar()

  const todayStr = today()
  const in14DaysStr = toISODateString(addDays(new Date(), 14))

  const activeProjects = state.projects
    .filter((p) => p.status === 'planning' || p.status === 'in-progress')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const upcomingShootDays = state.shootDays
    .filter((s) => s.date >= todayStr && s.date <= in14DaysStr)
    .sort((a, b) => a.date.localeCompare(b.date))

  const projectName = (id?: string) =>
    id ? (state.projects.find((p) => p.id === id)?.title ?? null) : null

  function navigateToShotlist(id: string) {
    dispatch({ type: 'SET_ACTIVE_SHOTLIST', id })
    dispatch({ type: 'SET_VIEW', view: 'shotlists' })
  }

  async function handleReturnLoan(loanId: string) {
    await returnLoan(loanId)
  }

  function handleHighlightLoan(loanId: string) {
    dispatch({ type: 'HIGHLIGHT_LOAN', loanId })
    dispatch({ type: 'SET_VIEW', view: 'calendar' })
  }

  const STATUS_LABELS: Record<string, string> = {
    planning: 'Planlegging',
    'in-progress': 'Pågår',
    delivered: 'Levert',
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-6" style={{ background: 'var(--color-bg)' }}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Hjem</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {formatDisplayDate(todayStr)}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Left column */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Stat cards — felt-layout inspirert av clapper board (PROD/SHOOT/SHOT/EQ) */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { fieldLabel: 'PROD', label: 'Aktive prosjekter', value: activeProjects.length, view: 'projects' as const },
              { fieldLabel: 'SHOOT', label: 'Kommende shoot-dager', value: upcomingShootDays.length, view: 'calendar' as const },
              { fieldLabel: 'SHOT', label: 'Shotlister', value: state.shotlists.length, view: 'shotlists' as const },
              { fieldLabel: 'EQ', label: 'Utstyr', value: state.equipment.length, view: 'equipment' as const },
            ].map((card) => (
              <button
                key={card.label}
                onClick={() => dispatch({ type: 'SET_VIEW', view: card.view })}
                className="rounded-lg border overflow-hidden text-left transition-colors hover:border-[var(--color-accent)]"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
              >
                <div
                  className="px-3 py-1 text-[9px] font-mono font-semibold uppercase tracking-widest"
                  style={{
                    background: 'var(--color-border)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {card.fieldLabel}
                </div>
                <div className="p-4">
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{card.value}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{card.label}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Upcoming shoot days */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Kommende shoot-dager
            </h2>
            {upcomingShootDays.length === 0 ? (
              <div
                className="rounded-lg border p-4 text-center"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
              >
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Ingen kommende shoot-dager de neste 14 dagene.
                </p>
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'calendar' })}
                  className="mt-2 text-xs hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Gå til kalender →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingShootDays.map((s) => {
                  const proj = projectName(s.projectId)
                  const linkedShotlists = state.shotlists.filter((sl) => sl.shootDayId === s.id)
                  return (
                    <div
                      key={s.id}
                      className="rounded-lg border p-3"
                      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded"
                              style={{ background: 'var(--color-accent)', color: 'var(--color-bg)', opacity: 0.9 }}
                            >
                              {formatShortDate(s.date)}
                            </span>
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                              {s.title}
                            </p>
                          </div>
                          {(s.location || proj) && (
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                              {[s.location, proj ? `Prosjekt: ${proj}` : null].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          {linkedShotlists.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {linkedShotlists.map((sl) => (
                                <button
                                  key={sl.id}
                                  onClick={() => navigateToShotlist(sl.id)}
                                  className="text-[10px] px-1.5 py-0.5 rounded border transition-colors hover:border-[var(--color-accent)]"
                                  style={{
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-accent)',
                                    background: 'var(--color-bg)',
                                  }}
                                >
                                  {sl.title || '(uten tittel)'} · {shotCount(sl)} shots
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => dispatch({ type: 'SET_VIEW', view: 'calendar' })}
                          className="text-xs flex-shrink-0"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          Vis →
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Active projects */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Aktive prosjekter
            </h2>
            {activeProjects.length === 0 ? (
              <div
                className="rounded-lg border p-4 text-center"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
              >
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen aktive prosjekter.</p>
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'projects' })}
                  className="mt-2 text-xs hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Opprett prosjekt →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {activeProjects.map((p) => {
                  const shootDays = state.shootDays.filter((s) => s.projectId === p.id)
                  const shotlists = state.shotlists.filter((sl) => sl.projectId === p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() => dispatch({ type: 'SET_VIEW', view: 'projects' })}
                      className="w-full text-left rounded-lg border p-3 transition-colors hover:border-[var(--color-accent)]"
                      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                          {p.title}
                        </p>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{
                            background: p.status === 'in-progress' ? 'rgba(137,196,207,0.15)' : 'rgba(137,196,207,0.08)',
                            color: 'var(--color-accent)',
                          }}
                        >
                          {STATUS_LABELS[p.status] ?? p.status}
                        </span>
                      </div>
                      {(shootDays.length > 0 || shotlists.length > 0) && (
                        <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          {[
                            shootDays.length > 0 ? `${shootDays.length} shoot-dag${shootDays.length !== 1 ? 'er' : ''}` : null,
                            shotlists.length > 0 ? `${shotlists.length} shotlist${shotlists.length !== 1 ? 'er' : ''}` : null,
                          ].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="w-56 flex-shrink-0 space-y-6">

          {/* Hurtiglenker */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Hurtiglenker
            </h2>
            <div className="space-y-2">
              {[
                { label: '+ Nytt prosjekt', view: 'projects' as const },
                { label: '+ Ny shoot-dag', view: 'calendar' as const },
                { label: '+ Ny shotlist', view: 'shotlists' as const },
                { label: '+ Nytt utstyr', view: 'equipment' as const },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={() => dispatch({ type: 'SET_VIEW', view: link.view })}
                  className="w-full text-left text-sm rounded-lg border px-3 py-2 transition-colors hover:border-[var(--color-accent)]"
                  style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Varsler */}
          {state.notifications.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                Varsler
              </h2>
              <div className="space-y-2">
                {state.notifications.map((n) => (
                  <div
                    key={n.loanId}
                    className="rounded-lg border p-3"
                    style={{
                      borderColor: 'rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.05)',
                    }}
                  >
                    <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{n.equipmentName}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {n.loanedTo} · {n.daysOverdue} dag{n.daysOverdue !== 1 ? 'er' : ''} forfalt
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleReturnLoan(n.loanId)}
                        className="text-[10px] px-2 py-0.5 rounded"
                        style={{
                          background: 'var(--color-accent)',
                          color: 'var(--color-bg)',
                        }}
                      >
                        Levert
                      </button>
                      <button
                        onClick={() => handleHighlightLoan(n.loanId)}
                        className="text-[10px] hover:underline"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        Vis i kalender
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
