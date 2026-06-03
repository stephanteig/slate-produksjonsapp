import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import { getOverdueLoans } from '../services/notificationService'

export function registerNotificationHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.NOTIFICATIONS_LIST, () => {
    try {
      return { success: true, data: getOverdueLoans() }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
