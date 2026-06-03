import { ipcMain, BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import {
  listEquipment,
  saveEquipment,
  deleteEquipment,
  listLoans,
} from '../services/vaultService'
import type { Equipment } from '../../shared/types/equipment'

export function registerEquipmentHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.EQUIPMENT_LIST, () => {
    try {
      return { success: true, data: listEquipment() }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.EQUIPMENT_SAVE, (_, equipment: Equipment) => {
    try {
      saveEquipment(equipment)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.EQUIPMENT_DELETE, (_, equipmentId: string) => {
    try {
      const loans = listLoans()
      const activeLoans = loans.filter(
        (l) => l.equipmentId === equipmentId && !l.returned
      )
      if (activeLoans.length > 0) {
        return {
          success: false,
          error: 'Kan ikke slette utstyr som er på aktivt utlån.',
          activeLoans,
        }
      }
      deleteEquipment(equipmentId)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.EQUIPMENT_PDF, async (event) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (!win) return { success: false, error: 'Fant ikke vindu' }

      const { dialog } = await import('electron')
      const result = await dialog.showSaveDialog(win, {
        title: 'Lagre utstyrsliste',
        defaultPath: 'utstyrsliste.pdf',
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      })
      if (result.canceled || !result.filePath) return { success: false, canceled: true }

      const data = await win.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
      })
      const fs = await import('fs')
      fs.writeFileSync(result.filePath, data)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
