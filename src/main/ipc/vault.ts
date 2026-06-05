import { ipcMain, dialog, app } from 'electron'
import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'
import { IPC_CHANNELS, CONFIG_FILENAME } from '../../shared/constants'
import { loadConfig, getConfigPath } from '../services/configService'
import { setVaultPath, initVaultStructure, getVaultPath } from '../services/vaultService'
import { startWatching } from '../services/watchService'
import { BrowserWindow } from 'electron'

export function registerVaultHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.VAULT_PICK_FOLDER, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Velg vault-mappe',
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle(IPC_CHANNELS.VAULT_PICK_FILE, async (_, options: { filters?: Electron.FileFilter[] }) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: options?.filters,
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle(IPC_CHANNELS.VAULT_CHECK_PATH, (_, p: string) => {
    try {
      return fs.existsSync(p) && fs.statSync(p).isDirectory()
    } catch {
      return false
    }
  })

  ipcMain.handle(IPC_CHANNELS.VAULT_INIT, (event, vaultPath: string) => {
    try {
      setVaultPath(vaultPath)
      initVaultStructure(vaultPath)
      const win = BrowserWindow.fromWebContents(event.sender)
      if (win) startWatching(vaultPath, win)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.VAULT_IMPORT_SLATE_DIR, async (_, vaultPath: string) => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Velg /Slate/-mappe å importere',
    })
    if (result.canceled || result.filePaths.length === 0) return { success: false, canceled: true }

    const sourcePath = result.filePaths[0]
    const destPath = path.join(vaultPath, 'Slate')
    try {
      if (!fs.existsSync(destPath)) {
        copyDirRecursive(sourcePath, destPath)
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.VAULT_EXPORT, async (_, vaultPath: string) => {
    const result = await dialog.showSaveDialog({
      title: 'Lagre Slate-eksport',
      defaultPath: `slate-export-${new Date().toISOString().split('T')[0]}.zip`,
      filters: [{ name: 'ZIP-arkiv', extensions: ['zip'] }],
    })
    if (result.canceled || !result.filePath) return { success: false, canceled: true }

    try {
      const zip = new AdmZip()
      const configPath = getConfigPath()
      if (fs.existsSync(configPath)) {
        zip.addLocalFile(configPath, '', CONFIG_FILENAME)
      }
      const slateDirPath = path.join(vaultPath, 'Slate')
      if (fs.existsSync(slateDirPath)) {
        zip.addLocalFolder(slateDirPath, 'Slate')
      }
      zip.writeZip(result.filePath)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.VAULT_IMPORT, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      title: 'Velg Slate-eksport å importere',
      filters: [{ name: 'ZIP-arkiv', extensions: ['zip'] }],
    })
    if (result.canceled || result.filePaths.length === 0) return { success: false, canceled: true }

    try {
      const zip = new AdmZip(result.filePaths[0])
      const entries = zip.getEntries()

      const hasConfig = entries.some((e) => e.entryName === CONFIG_FILENAME)
      const hasSlate = entries.some((e) => e.entryName.startsWith('Slate/'))

      if (!hasConfig && !hasSlate) {
        return { success: false, error: 'Ugyldig eksport-fil — mangler forventet struktur.' }
      }

      const userData = app.getPath('userData')
      zip.extractAllTo(userData, true)

      const importedConfig = loadConfig()
      return { success: true, config: importedConfig }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.VAULT_READ_IMAGE, (_, relativePath: string) => {
    try {
      const vp = getVaultPath()
      if (!vp) return { success: false, error: 'Vault-sti er ikke konfigurert.' }
      const absPath = path.join(vp, relativePath)
      if (!fs.existsSync(absPath)) return { success: false, error: 'Fant ikke bildet.' }
      const buffer = fs.readFileSync(absPath)
      const ext = path.extname(absPath).slice(1).toLowerCase()
      const mime =
        ext === 'jpg' || ext === 'jpeg'
          ? 'image/jpeg'
          : ext === 'png'
            ? 'image/png'
            : 'image/webp'
      return { success: true, data: `data:${mime};base64,${buffer.toString('base64')}` }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}

function copyDirRecursive(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item)
    const destPath = path.join(dest, item)
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}
