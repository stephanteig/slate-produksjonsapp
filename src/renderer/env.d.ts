/// <reference types="vite/client" />

import type { Project, Task } from '../shared/types/project'
import type { Equipment, Loan } from '../shared/types/equipment'
import type { ShootDay } from '../shared/types/calendar'
import type { Kit } from '../shared/types/kit'
import type { SlateConfig } from '../shared/types/config'
import type { LoanNotification } from '../shared/types/notification'

interface IpcResult<T = undefined> {
  success: boolean
  data?: T
  error?: string
  canceled?: boolean
}

interface ElectronAPI {
  // Config
  configExists: () => Promise<boolean>
  getConfig: () => Promise<IpcResult<SlateConfig>>
  saveConfig: (config: SlateConfig) => Promise<IpcResult>

  // Vault
  pickFolder: () => Promise<string | null>
  pickFile: (options?: { filters?: Array<{ name: string; extensions: string[] }> }) => Promise<string | null>
  initVault: (vaultPath: string) => Promise<IpcResult>
  exportData: (vaultPath: string) => Promise<IpcResult>
  importData: () => Promise<IpcResult<SlateConfig> & { config: SlateConfig }>
  importSlateDir: (vaultPath: string) => Promise<IpcResult>

  // Projects
  listProjects: () => Promise<IpcResult<Project[]>>
  saveProject: (project: Project) => Promise<IpcResult>
  saveProjectTasks: (projectId: string, tasks: Task[]) => Promise<IpcResult>

  // Equipment
  listEquipment: () => Promise<IpcResult<Equipment[]>>
  saveEquipment: (equipment: Equipment) => Promise<IpcResult>
  deleteEquipment: (equipmentId: string) => Promise<IpcResult & { activeLoans?: Loan[] }>
  exportEquipmentPdf: () => Promise<IpcResult>

  // Loans
  listLoans: () => Promise<IpcResult<Loan[]>>
  saveLoan: (loan: Loan) => Promise<IpcResult>
  returnLoan: (loanId: string) => Promise<IpcResult>

  // Calendar
  listShootDays: () => Promise<IpcResult<ShootDay[]>>
  saveShootDay: (day: ShootDay) => Promise<IpcResult>
  deleteShootDay: (dayId: string) => Promise<IpcResult>

  // Kits
  listKits: () => Promise<IpcResult<Kit[]>>
  saveKit: (kit: Kit) => Promise<IpcResult>
  deleteKit: (kitId: string) => Promise<IpcResult>

  // Notifications
  listNotifications: () => Promise<IpcResult<LoanNotification[]>>

  // Event listeners
  onVaultChanged: (callback: (data: { event: string; filename: string }) => void) => void
  onNotificationsUpdate: (callback: (data: LoanNotification[]) => void) => void
  removeAllListeners: (channel: string) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
