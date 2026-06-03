export const VAULT_SUBDIR = 'Slate'
export const CONFIG_FILENAME = 'slate-config.json'
export const DEFAULT_THEME = 'nordic-slate'

export const THEMES = [
  'nordic-slate',
  'soft-dusk',
  'tokyo-night',
  'paper-ink',
  'lavender-fog',
  'iron-press',
] as const

export type ThemeName = (typeof THEMES)[number]

export const IPC_CHANNELS = {
  // Config
  CONFIG_GET: 'config:get',
  CONFIG_SAVE: 'config:save',
  CONFIG_EXISTS: 'config:exists',

  // Vault
  VAULT_PICK_FOLDER: 'vault:pickFolder',
  VAULT_PICK_FILE: 'vault:pickFile',
  VAULT_INIT: 'vault:init',
  VAULT_EXPORT: 'vault:export',
  VAULT_IMPORT: 'vault:import',
  VAULT_IMPORT_SLATE_DIR: 'vault:importSlateDir',

  // Projects
  PROJECTS_LIST: 'projects:list',
  PROJECTS_GET: 'projects:get',
  PROJECTS_SAVE: 'projects:save',
  PROJECTS_TASKS_SAVE: 'projects:tasks:save',

  // Equipment
  EQUIPMENT_LIST: 'equipment:list',
  EQUIPMENT_GET: 'equipment:get',
  EQUIPMENT_SAVE: 'equipment:save',
  EQUIPMENT_DELETE: 'equipment:delete',
  EQUIPMENT_PDF: 'equipment:exportPdf',

  // Loans
  LOANS_LIST: 'loans:list',
  LOANS_SAVE: 'loans:save',
  LOANS_RETURN: 'loans:return',

  // Calendar
  CALENDAR_LIST: 'calendar:list',
  CALENDAR_SAVE: 'calendar:save',
  CALENDAR_DELETE: 'calendar:delete',

  // Kits
  KITS_LIST: 'kits:list',
  KITS_SAVE: 'kits:save',
  KITS_DELETE: 'kits:delete',

  // Notifications
  NOTIFICATIONS_LIST: 'notifications:list',
} as const
