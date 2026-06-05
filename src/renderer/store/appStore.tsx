import React, { createContext, useContext, useReducer } from 'react'
import type { SlateConfig } from '../../shared/types/config'
import type { Project } from '../../shared/types/project'
import type { Equipment, Loan } from '../../shared/types/equipment'
import type { ShootDay } from '../../shared/types/calendar'
import type { Kit } from '../../shared/types/kit'
import type { LoanNotification } from '../../shared/types/notification'
import type { Shotlist } from '../../shared/types/shotlist'

export type AppView =
  | 'onboarding'
  | 'home'
  | 'projects'
  | 'equipment'
  | 'calendar'
  | 'kits'
  | 'shotlists'
  | 'settings'

interface AppState {
  view: AppView
  config: SlateConfig | null
  projects: Project[]
  equipment: Equipment[]
  loans: Loan[]
  shootDays: ShootDay[]
  kits: Kit[]
  shotlists: Shotlist[]
  notifications: LoanNotification[]
  highlightedLoanId: string | null
  activeShotlistId: string | null
}

type AppAction =
  | { type: 'SET_VIEW'; view: AppView }
  | { type: 'SET_CONFIG'; config: SlateConfig }
  | { type: 'SET_PROJECTS'; projects: Project[] }
  | { type: 'SET_EQUIPMENT'; equipment: Equipment[] }
  | { type: 'SET_LOANS'; loans: Loan[] }
  | { type: 'SET_SHOOT_DAYS'; shootDays: ShootDay[] }
  | { type: 'SET_KITS'; kits: Kit[] }
  | { type: 'SET_SHOTLISTS'; shotlists: Shotlist[] }
  | { type: 'SET_NOTIFICATIONS'; notifications: LoanNotification[] }
  | { type: 'HIGHLIGHT_LOAN'; loanId: string | null }
  | { type: 'SET_ACTIVE_SHOTLIST'; id: string | null }

const initialState: AppState = {
  view: 'onboarding',
  config: null,
  projects: [],
  equipment: [],
  loans: [],
  shootDays: [],
  kits: [],
  shotlists: [],
  notifications: [],
  highlightedLoanId: null,
  activeShotlistId: null,
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.view }
    case 'SET_CONFIG':
      return { ...state, config: action.config }
    case 'SET_PROJECTS':
      return { ...state, projects: action.projects }
    case 'SET_EQUIPMENT':
      return { ...state, equipment: action.equipment }
    case 'SET_LOANS':
      return { ...state, loans: action.loans }
    case 'SET_SHOOT_DAYS':
      return { ...state, shootDays: action.shootDays }
    case 'SET_KITS':
      return { ...state, kits: action.kits }
    case 'SET_SHOTLISTS':
      return { ...state, shotlists: action.shotlists }
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.notifications }
    case 'HIGHLIGHT_LOAN':
      return { ...state, highlightedLoanId: action.loanId }
    case 'SET_ACTIVE_SHOTLIST':
      return { ...state, activeShotlistId: action.id }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore must be used within AppProvider')
  return ctx
}
