import React, { useEffect, useCallback } from 'react'
import { AppProvider, useAppStore } from './store/appStore'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { MainPanel } from './components/layout/MainPanel'
import { ProjectList } from './components/projects/ProjectList'
import { EquipmentList } from './components/equipment/EquipmentList'
import { CalendarView } from './components/calendar/CalendarView'
import { KitList } from './components/equipment/KitList'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { ShotlistView } from './components/shotlists/ShotlistView'
import { HomeView } from './components/home/HomeView'
import { useNotifications } from './hooks/useNotifications'
import { useTheme } from './hooks/useTheme'

function AppContent() {
  const { state, dispatch } = useAppStore()
  useNotifications()
  useTheme()

  const loadAllData = useCallback(async () => {
    const [projects, equipment, loans, shootDays, kits, shotlists, notifications] = await Promise.all([
      window.electronAPI.listProjects(),
      window.electronAPI.listEquipment(),
      window.electronAPI.listLoans(),
      window.electronAPI.listShootDays(),
      window.electronAPI.listKits(),
      window.electronAPI.listShotlists(),
      window.electronAPI.listNotifications(),
    ])
    if (projects.success) dispatch({ type: 'SET_PROJECTS', projects: projects.data! })
    if (equipment.success) dispatch({ type: 'SET_EQUIPMENT', equipment: equipment.data! })
    if (loans.success) dispatch({ type: 'SET_LOANS', loans: loans.data! })
    if (shootDays.success) dispatch({ type: 'SET_SHOOT_DAYS', shootDays: shootDays.data! })
    if (kits.success) dispatch({ type: 'SET_KITS', kits: kits.data! })
    if (shotlists.success) dispatch({ type: 'SET_SHOTLISTS', shotlists: shotlists.data! })
    if (notifications.success) dispatch({ type: 'SET_NOTIFICATIONS', notifications: notifications.data! })
  }, [dispatch])

  useEffect(() => {
    async function init() {
      const exists = await window.electronAPI.configExists()
      if (!exists) {
        dispatch({ type: 'SET_VIEW', view: 'onboarding' })
        return
      }
      const result = await window.electronAPI.getConfig()
      if (!result.success || !result.data?.vaultPath) {
        dispatch({ type: 'SET_VIEW', view: 'onboarding' })
        return
      }
      dispatch({ type: 'SET_CONFIG', config: result.data })
      dispatch({ type: 'SET_VIEW', view: 'home' })
    }
    init()
  }, [dispatch])

  useEffect(() => {
    if (state.config?.vaultPath && state.view !== 'onboarding') {
      loadAllData()
    }
  }, [state.config?.vaultPath, state.view, loadAllData])

  // Listen for vault changes and reload data
  useEffect(() => {
    window.electronAPI.onVaultChanged(() => {
      if (state.config?.vaultPath) loadAllData()
    })
    return () => window.electronAPI.removeAllListeners('vault:changed')
  }, [state.config?.vaultPath, loadAllData])

  if (state.view === 'onboarding') {
    return <OnboardingFlow />
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <MainPanel>
          {state.view === 'home' && <HomeView />}
          {state.view === 'projects' && <ProjectList />}
          {state.view === 'equipment' && <EquipmentList />}
          {state.view === 'calendar' && <CalendarView />}
          {state.view === 'kits' && <KitList />}
          {state.view === 'shotlists' && <ShotlistView />}
          {state.view === 'settings' && <SettingsPanel />}
        </MainPanel>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
