import fs from 'fs'
import path from 'path'
import { VAULT_SUBDIR } from '../../shared/constants'
import type { Project, Task } from '../../shared/types/project'
import type { Equipment, Loan } from '../../shared/types/equipment'
import type { ShootDay } from '../../shared/types/calendar'
import type { Kit } from '../../shared/types/kit'
import {
  parseProjectFile,
  serializeProjectFile,
  parseTasksFile,
  serializeTasksFile,
  parseEquipmentFile,
  serializeEquipmentFile,
  parseLoanFile,
  serializeLoanFile,
  parseShootDayFile,
  serializeShootDayFile,
  parseKitFile,
  serializeKitFile,
} from './markdownService'

let vaultPath = ''

export function setVaultPath(p: string): void {
  vaultPath = p
}

export function getVaultPath(): string {
  return vaultPath
}

function slatePath(...segments: string[]): string {
  return path.join(vaultPath, VAULT_SUBDIR, ...segments)
}

export function initVaultStructure(vp: string): void {
  const dirs = [
    path.join(vp, VAULT_SUBDIR, 'projects'),
    path.join(vp, VAULT_SUBDIR, 'equipment', 'loans'),
    path.join(vp, VAULT_SUBDIR, 'kits'),
    path.join(vp, VAULT_SUBDIR, 'calendar'),
  ]
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
}

// ── Slugify ───────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// ── Projects ──────────────────────────────────────────────────────────────────

export function listProjects(): Project[] {
  const dir = slatePath('projects')
  if (!fs.existsSync(dir)) return []

  const projects: Project[] = []
  for (const slug of fs.readdirSync(dir)) {
    const projectFile = path.join(dir, slug, 'project.md')
    const tasksFile = path.join(dir, slug, 'tasks.md')
    if (!fs.existsSync(projectFile)) continue
    try {
      const projectData = parseProjectFile(fs.readFileSync(projectFile, 'utf-8'))
      const tasks = fs.existsSync(tasksFile)
        ? parseTasksFile(fs.readFileSync(tasksFile, 'utf-8'))
        : []
      projects.push({ ...projectData, tasks })
    } catch {
      // Skip malformed files
    }
  }
  return projects
}

export function saveProject(project: Project): void {
  const slug = slugify(project.title) || project.id
  const dir = slatePath('projects', slug)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const { tasks, ...projectData } = project
  fs.writeFileSync(path.join(dir, 'project.md'), serializeProjectFile(projectData), 'utf-8')
  fs.writeFileSync(path.join(dir, 'tasks.md'), serializeTasksFile(project.id, tasks), 'utf-8')
}

export function saveProjectTasks(projectId: string, tasks: Task[]): void {
  const dir = slatePath('projects')
  if (!fs.existsSync(dir)) return

  for (const slug of fs.readdirSync(dir)) {
    const projectFile = path.join(dir, slug, 'project.md')
    if (!fs.existsSync(projectFile)) continue
    const data = parseProjectFile(fs.readFileSync(projectFile, 'utf-8'))
    if (data.id === projectId) {
      fs.writeFileSync(
        path.join(dir, slug, 'tasks.md'),
        serializeTasksFile(projectId, tasks),
        'utf-8'
      )
      return
    }
  }
}

// ── Equipment ─────────────────────────────────────────────────────────────────

export function listEquipment(): Equipment[] {
  const dir = slatePath('equipment')
  if (!fs.existsSync(dir)) return []

  const items: Equipment[] = []
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md') || file.startsWith('.')) continue
    if (file === 'loans') continue
    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8')
      items.push(parseEquipmentFile(content))
    } catch {
      // Skip malformed
    }
  }
  return items
}

export function saveEquipment(equipment: Equipment): void {
  const slug = slugify(equipment.name) || equipment.id
  const filePath = slatePath('equipment', `${slug}.md`)
  fs.writeFileSync(filePath, serializeEquipmentFile(equipment), 'utf-8')
}

export function deleteEquipment(equipmentId: string): void {
  const dir = slatePath('equipment')
  if (!fs.existsSync(dir)) return

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue
    const filePath = path.join(dir, file)
    try {
      const eq = parseEquipmentFile(fs.readFileSync(filePath, 'utf-8'))
      if (eq.id === equipmentId) {
        fs.unlinkSync(filePath)
        return
      }
    } catch {
      // Skip
    }
  }
}

// ── Loans ─────────────────────────────────────────────────────────────────────

export function listLoans(): Loan[] {
  const dir = slatePath('equipment', 'loans')
  if (!fs.existsSync(dir)) return []

  const loans: Loan[] = []
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue
    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8')
      loans.push(parseLoanFile(content))
    } catch {
      // Skip
    }
  }
  return loans
}

export function saveLoan(loan: Loan, equipmentName: string): void {
  const slug = slugify(equipmentName) || loan.equipmentId
  const filename = `${loan.startDate}-${slug}.md`
  const filePath = slatePath('equipment', 'loans', filename)
  fs.writeFileSync(filePath, serializeLoanFile(loan), 'utf-8')

  // Update equipment status
  updateEquipmentStatus(loan.equipmentId, loan.returned ? 'available' : 'on-loan')
}

export function returnLoan(loanId: string): void {
  const dir = slatePath('equipment', 'loans')
  if (!fs.existsSync(dir)) return

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue
    const filePath = path.join(dir, file)
    try {
      const loan = parseLoanFile(fs.readFileSync(filePath, 'utf-8'))
      if (loan.id === loanId) {
        loan.returned = true
        fs.writeFileSync(filePath, serializeLoanFile(loan), 'utf-8')
        updateEquipmentStatus(loan.equipmentId, 'available')
        return
      }
    } catch {
      // Skip
    }
  }
}

function updateEquipmentStatus(
  equipmentId: string,
  status: Equipment['status']
): void {
  const dir = slatePath('equipment')
  if (!fs.existsSync(dir)) return

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md') || file === 'loans') continue
    const filePath = path.join(dir, file)
    try {
      const eq = parseEquipmentFile(fs.readFileSync(filePath, 'utf-8'))
      if (eq.id === equipmentId) {
        eq.status = status
        fs.writeFileSync(filePath, serializeEquipmentFile(eq), 'utf-8')
        return
      }
    } catch {
      // Skip
    }
  }
}

// ── Calendar ──────────────────────────────────────────────────────────────────

export function listShootDays(): ShootDay[] {
  const dir = slatePath('calendar')
  if (!fs.existsSync(dir)) return []

  const days: ShootDay[] = []
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue
    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8')
      days.push(parseShootDayFile(content))
    } catch {
      // Skip
    }
  }
  return days
}

export function saveShootDay(day: ShootDay): void {
  const filename = `${day.date}.md`
  const filePath = slatePath('calendar', filename)
  fs.writeFileSync(filePath, serializeShootDayFile(day), 'utf-8')
}

export function deleteShootDay(dayId: string): void {
  const dir = slatePath('calendar')
  if (!fs.existsSync(dir)) return

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue
    const filePath = path.join(dir, file)
    try {
      const day = parseShootDayFile(fs.readFileSync(filePath, 'utf-8'))
      if (day.id === dayId) {
        fs.unlinkSync(filePath)
        return
      }
    } catch {
      // Skip
    }
  }
}

// ── Kits ──────────────────────────────────────────────────────────────────────

export function listKits(): Kit[] {
  const dir = slatePath('kits')
  if (!fs.existsSync(dir)) return []

  const kits: Kit[] = []
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue
    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8')
      kits.push(parseKitFile(content))
    } catch {
      // Skip
    }
  }
  return kits
}

export function saveKit(kit: Kit): void {
  const slug = slugify(kit.name) || kit.id
  const filePath = slatePath('kits', `${slug}.md`)
  fs.writeFileSync(filePath, serializeKitFile(kit), 'utf-8')
}

export function deleteKit(kitId: string): void {
  const dir = slatePath('kits')
  if (!fs.existsSync(dir)) return

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue
    const filePath = path.join(dir, file)
    try {
      const kit = parseKitFile(fs.readFileSync(filePath, 'utf-8'))
      if (kit.id === kitId) {
        fs.unlinkSync(filePath)
        return
      }
    } catch {
      // Skip
    }
  }
}
