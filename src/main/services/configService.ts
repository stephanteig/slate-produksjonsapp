import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import type { SlateConfig } from '../../shared/types/config'
import { DEFAULT_THEME, CONFIG_FILENAME } from '../../shared/constants'

const CONFIG_PATH = path.join(app.getPath('userData'), CONFIG_FILENAME)

const defaultConfig: SlateConfig = {
  vaultPath: '',
  theme: DEFAULT_THEME,
  owners: [],
}

export function configExists(): boolean {
  return fs.existsSync(CONFIG_PATH)
}

export function loadConfig(): SlateConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { ...defaultConfig }
  }
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<SlateConfig>
    return {
      vaultPath: parsed.vaultPath ?? '',
      theme: parsed.theme ?? DEFAULT_THEME,
      owners: parsed.owners ?? [],
    }
  } catch {
    return { ...defaultConfig }
  }
}

export function saveConfig(config: SlateConfig): void {
  const dir = path.dirname(CONFIG_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
}

export function getConfigPath(): string {
  return CONFIG_PATH
}
