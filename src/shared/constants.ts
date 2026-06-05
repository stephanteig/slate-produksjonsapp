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
  VAULT_CHECK_PATH: 'vault:checkPath',
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

  // Shotlists
  SHOTLISTS_LIST: 'shotlists:list',
  SHOTLISTS_SAVE: 'shotlists:save',
  SHOTLISTS_DELETE: 'shotlists:delete',
  SHOTLISTS_IMPORT_SWSHOT: 'shotlists:importSwshot',
  SHOTLISTS_EXPORT_PDF: 'shotlists:exportPdf',
  SHOTLISTS_UPLOAD_IMAGE: 'shotlists:uploadImage',
  VAULT_READ_IMAGE: 'vault:readImage',
  SHOOTDAY_EXPORT_PDF: 'calendar:exportShootDayPdf',
} as const

export const SECTION_COLORS = [
  '#4f8ef7', '#e06b74', '#98c379', '#e5c07b',
  '#c678dd', '#56b6c2', '#d19a66', '#abb2bf',
] as const

export const DEFAULT_SECTION_COLOR = '#4f8ef7'

export const SHOT_SIZES = [
  'Ekstrem vidvinkel',
  'Vidvinkel',
  'Medium vidvinkel',
  'Medium',
  'Medium nært',
  'Nært',
  'Ekstremt nært',
  'Over-shoulder',
  'Insert/Detalj',
] as const

export const CAMERA_MOVEMENTS = [
  'Statisk',
  'Pan',
  'Tilt',
  'Dolly inn',
  'Dolly ut',
  'Truck',
  'Håndholdt',
  'Steadicam',
  'Crane/Jib',
  'Zoom inn',
  'Zoom ut',
  'Rack focus',
] as const
