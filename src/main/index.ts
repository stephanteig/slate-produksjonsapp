import { app, BrowserWindow, shell } from 'electron'
import path from 'path'
import { registerConfigHandlers } from './ipc/config'
import { registerVaultHandlers } from './ipc/vault'
import { registerProjectHandlers } from './ipc/projects'
import { registerEquipmentHandlers } from './ipc/equipment'
import { registerCalendarHandlers } from './ipc/calendar'
import { registerKitHandlers } from './ipc/kits'
import { registerNotificationHandlers } from './ipc/notifications'
import { loadConfig, configExists } from './services/configService'
import { setVaultPath, initVaultStructure } from './services/vaultService'
import { startWatching } from './services/watchService'
import { getOverdueLoans } from './services/notificationService'

const isDev = !app.isPackaged

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Slate',
    backgroundColor: '#1e2327',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  })

  if (isDev) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']!)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  return win
}

app.whenReady().then(() => {
  registerConfigHandlers()
  registerVaultHandlers()
  registerProjectHandlers()
  registerEquipmentHandlers()
  registerCalendarHandlers()
  registerKitHandlers()
  registerNotificationHandlers()

  const win = createWindow()

  if (configExists()) {
    const config = loadConfig()
    if (config.vaultPath) {
      setVaultPath(config.vaultPath)
      try {
        initVaultStructure(config.vaultPath)
        startWatching(config.vaultPath, win)
      } catch {
        // Vault path may not be accessible — onboarding will handle it
      }
    }
  }

  // Check overdue loans every 24 hours
  setInterval(
    () => {
      try {
        const overdue = getOverdueLoans()
        if (overdue.length > 0) {
          win.webContents.send('notifications:update', overdue)
        }
      } catch {
        // Ignore errors in background check
      }
    },
    24 * 60 * 60 * 1000
  )

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
