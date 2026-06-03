import fs from 'fs'
import path from 'path'
import { BrowserWindow } from 'electron'
import { VAULT_SUBDIR } from '../../shared/constants'

let watcher: fs.FSWatcher | null = null

export function startWatching(vaultPath: string, win: BrowserWindow): void {
  stopWatching()

  const slateDir = path.join(vaultPath, VAULT_SUBDIR)
  if (!fs.existsSync(slateDir)) return

  watcher = fs.watch(slateDir, { recursive: true }, (event, filename) => {
    if (!filename) return
    win.webContents.send('vault:changed', { event, filename })
  })
}

export function stopWatching(): void {
  if (watcher) {
    watcher.close()
    watcher = null
  }
}
