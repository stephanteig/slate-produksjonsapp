import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import { listKits, saveKit, deleteKit } from '../services/vaultService'
import type { Kit } from '../../shared/types/kit'

export function registerKitHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.KITS_LIST, () => {
    try {
      return { success: true, data: listKits() }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.KITS_SAVE, (_, kit: Kit) => {
    try {
      saveKit(kit)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.KITS_DELETE, (_, kitId: string) => {
    try {
      deleteKit(kitId)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
