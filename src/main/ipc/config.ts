import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import { loadConfig, saveConfig, configExists } from '../services/configService'
import type { SlateConfig } from '../../shared/types/config'

export function registerConfigHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.CONFIG_EXISTS, () => {
    return configExists()
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG_GET, () => {
    try {
      return { success: true, data: loadConfig() }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG_SAVE, (_, config: SlateConfig) => {
    try {
      saveConfig(config)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
