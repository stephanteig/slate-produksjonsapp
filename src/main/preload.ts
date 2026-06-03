import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/constants'
import type { Project, Task } from '../shared/types/project'
import type { Equipment, Loan } from '../shared/types/equipment'
import type { ShootDay } from '../shared/types/calendar'
import type { Kit } from '../shared/types/kit'
import type { SlateConfig } from '../shared/types/config'

contextBridge.exposeInMainWorld('electronAPI', {
  // Config
  configExists: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_EXISTS),
  getConfig: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET),
  saveConfig: (config: SlateConfig) => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_SAVE, config),

  // Vault
  pickFolder: () => ipcRenderer.invoke(IPC_CHANNELS.VAULT_PICK_FOLDER),
  pickFile: (options?: { filters?: Electron.FileFilter[] }) =>
    ipcRenderer.invoke(IPC_CHANNELS.VAULT_PICK_FILE, options),
  initVault: (vaultPath: string) => ipcRenderer.invoke(IPC_CHANNELS.VAULT_INIT, vaultPath),
  exportData: (vaultPath: string) => ipcRenderer.invoke(IPC_CHANNELS.VAULT_EXPORT, vaultPath),
  importData: () => ipcRenderer.invoke(IPC_CHANNELS.VAULT_IMPORT),
  importSlateDir: (vaultPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.VAULT_IMPORT_SLATE_DIR, vaultPath),

  // Projects
  listProjects: () => ipcRenderer.invoke(IPC_CHANNELS.PROJECTS_LIST),
  saveProject: (project: Project) => ipcRenderer.invoke(IPC_CHANNELS.PROJECTS_SAVE, project),
  saveProjectTasks: (projectId: string, tasks: Task[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.PROJECTS_TASKS_SAVE, projectId, tasks),

  // Equipment
  listEquipment: () => ipcRenderer.invoke(IPC_CHANNELS.EQUIPMENT_LIST),
  saveEquipment: (equipment: Equipment) =>
    ipcRenderer.invoke(IPC_CHANNELS.EQUIPMENT_SAVE, equipment),
  deleteEquipment: (equipmentId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.EQUIPMENT_DELETE, equipmentId),
  exportEquipmentPdf: () => ipcRenderer.invoke(IPC_CHANNELS.EQUIPMENT_PDF),

  // Loans
  listLoans: () => ipcRenderer.invoke(IPC_CHANNELS.LOANS_LIST),
  saveLoan: (loan: Loan) => ipcRenderer.invoke(IPC_CHANNELS.LOANS_SAVE, loan),
  returnLoan: (loanId: string) => ipcRenderer.invoke(IPC_CHANNELS.LOANS_RETURN, loanId),

  // Calendar
  listShootDays: () => ipcRenderer.invoke(IPC_CHANNELS.CALENDAR_LIST),
  saveShootDay: (day: ShootDay) => ipcRenderer.invoke(IPC_CHANNELS.CALENDAR_SAVE, day),
  deleteShootDay: (dayId: string) => ipcRenderer.invoke(IPC_CHANNELS.CALENDAR_DELETE, dayId),

  // Kits
  listKits: () => ipcRenderer.invoke(IPC_CHANNELS.KITS_LIST),
  saveKit: (kit: Kit) => ipcRenderer.invoke(IPC_CHANNELS.KITS_SAVE, kit),
  deleteKit: (kitId: string) => ipcRenderer.invoke(IPC_CHANNELS.KITS_DELETE, kitId),

  // Notifications
  listNotifications: () => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS_LIST),

  // Event listeners (vault changes, notification updates)
  onVaultChanged: (callback: (data: { event: string; filename: string }) => void) => {
    ipcRenderer.on('vault:changed', (_, data) => callback(data))
  },
  onNotificationsUpdate: (callback: (data: unknown[]) => void) => {
    ipcRenderer.on('notifications:update', (_, data) => callback(data))
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  },
})
