import matter from 'gray-matter'
import { randomUUID } from 'crypto'
import type { Project, Task } from '../../shared/types/project'
import type { Equipment, Loan } from '../../shared/types/equipment'
import type { ShootDay } from '../../shared/types/calendar'
import type { Kit } from '../../shared/types/kit'
import type { Shotlist, ShotSection, ShotRow } from '../../shared/types/shotlist'

function toDateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().split('T')[0]
  return String(value ?? '')
}

// ── Projects ────────────────────────────────────────────────────────────────

export function parseProjectFile(content: string): Omit<Project, 'tasks'> {
  const { data } = matter(content)
  return {
    id: String(data.id ?? ''),
    title: String(data.title ?? ''),
    status: data.status ?? 'planning',
    dropboxUrl: data.dropbox,
    createdAt: toDateString(data.created),
    updatedAt: toDateString(data.updated),
    tags: data.tags ?? [],
  }
}

export function serializeProjectFile(project: Omit<Project, 'tasks'>): string {
  const frontmatter = {
    id: project.id,
    title: project.title,
    status: project.status,
    ...(project.dropboxUrl ? { dropbox: project.dropboxUrl } : {}),
    created: project.createdAt,
    updated: project.updatedAt,
    tags: project.tags ?? ['slate', 'project'],
  }
  return matter.stringify('', frontmatter)
}

export function parseTasksFile(content: string): Task[] {
  const { content: body } = matter(content)
  return parseTaskLines(body.trim().split('\n'))
}

function parseTaskLines(lines: string[]): Task[] {
  const tasks: Task[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const topMatch = line.match(/^- \[(x| )\] (.+)/)
    if (topMatch) {
      const task: Task = {
        id: randomUUID(),
        title: topMatch[2].trim(),
        completed: topMatch[1] === 'x',
        subtasks: [],
        createdAt: new Date().toISOString(),
      }
      i++
      while (i < lines.length && lines[i].match(/^  - \[(x| )\] /)) {
        const subMatch = lines[i].match(/^  - \[(x| )\] (.+)/)
        if (subMatch) {
          task.subtasks!.push({
            id: randomUUID(),
            title: subMatch[2].trim(),
            completed: subMatch[1] === 'x',
            createdAt: new Date().toISOString(),
          })
        }
        i++
      }
      tasks.push(task)
    } else {
      i++
    }
  }
  return tasks
}

export function serializeTasksFile(projectId: string, tasks: Task[]): string {
  const frontmatter = { projectId }
  const lines = tasks.flatMap((task) => {
    const check = task.completed ? 'x' : ' '
    const line = `- [${check}] ${task.title}`
    const subtaskLines = (task.subtasks ?? []).map((sub) => {
      const subCheck = sub.completed ? 'x' : ' '
      return `  - [${subCheck}] ${sub.title}`
    })
    return [line, ...subtaskLines]
  })
  return matter.stringify(lines.join('\n'), frontmatter)
}

// ── Equipment ────────────────────────────────────────────────────────────────

export function parseEquipmentFile(content: string): Equipment {
  const { data, content: body } = matter(content)
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    ownerId: data.ownerId,
    serialNumber: data.serialNumber,
    purchasePrice: data.purchasePrice,
    status: data.status ?? 'available',
    notes: body.trim() || undefined,
    createdAt: data.created,
  }
}

export function serializeEquipmentFile(equipment: Equipment): string {
  const frontmatter = {
    id: equipment.id,
    name: equipment.name,
    category: equipment.category,
    ownerId: equipment.ownerId,
    ...(equipment.serialNumber ? { serialNumber: equipment.serialNumber } : {}),
    ...(equipment.purchasePrice !== undefined ? { purchasePrice: equipment.purchasePrice } : {}),
    status: equipment.status,
    created: equipment.createdAt,
  }
  return matter.stringify(equipment.notes ?? '', frontmatter)
}

// ── Loans ────────────────────────────────────────────────────────────────────

export function parseLoanFile(content: string): Loan {
  const { data, content: body } = matter(content)
  return {
    id: String(data.id ?? ''),
    equipmentId: String(data.equipmentId ?? ''),
    loanedTo: String(data.loanedTo ?? ''),
    startDate: toDateString(data.startDate),
    endDate: toDateString(data.endDate),
    returned: Boolean(data.returned),
    projectId: data.projectId,
    notes: body.trim() || undefined,
  }
}

export function serializeLoanFile(loan: Loan): string {
  const frontmatter = {
    id: loan.id,
    equipmentId: loan.equipmentId,
    loanedTo: loan.loanedTo,
    startDate: loan.startDate,
    endDate: loan.endDate,
    returned: loan.returned,
    ...(loan.projectId ? { projectId: loan.projectId } : {}),
  }
  return matter.stringify(loan.notes ?? '', frontmatter)
}

// ── ShootDay ─────────────────────────────────────────────────────────────────

export function parseShootDayFile(content: string): ShootDay {
  const { data, content: body } = matter(content)
  return {
    id: data.id,
    date: data.date,
    title: data.title,
    projectId: data.projectId,
    location: data.location,
    crew: data.crew,
    equipmentIds: data.equipmentIds ?? [],
    notes: body.trim() || undefined,
  }
}

export function serializeShootDayFile(day: ShootDay): string {
  const frontmatter = {
    id: day.id,
    date: day.date,
    title: day.title,
    ...(day.projectId ? { projectId: day.projectId } : {}),
    ...(day.location ? { location: day.location } : {}),
    ...(day.crew ? { crew: day.crew } : {}),
    ...(day.equipmentIds?.length ? { equipmentIds: day.equipmentIds } : {}),
  }
  return matter.stringify(day.notes ?? '', frontmatter)
}

// ── Kits ─────────────────────────────────────────────────────────────────────

export function parseKitFile(content: string): Kit {
  const { data, content: body } = matter(content)
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    shotType: data.shotType,
    equipmentIds: data.equipmentIds ?? [],
    notes: body.trim() || undefined,
  }
}

export function serializeKitFile(kit: Kit): string {
  const frontmatter = {
    id: kit.id,
    name: kit.name,
    ...(kit.description ? { description: kit.description } : {}),
    shotType: kit.shotType,
    equipmentIds: kit.equipmentIds,
  }
  return matter.stringify(kit.notes ?? '', frontmatter)
}

// ── Shotlists ─────────────────────────────────────────────────────────────────

export function parseShotlistFile(content: string): Shotlist {
  const { data } = matter(content)
  const sections: ShotSection[] = (data.sections ?? []).map((s: Record<string, unknown>) => ({
    id: String(s.id ?? randomUUID()),
    name: String(s.name ?? ''),
    color: String(s.color ?? '#4f8ef7'),
    collapsed: Boolean(s.collapsed ?? false),
    rows: ((s.rows as Record<string, unknown>[]) ?? []).map((r) => ({
      id: String(r.id ?? randomUUID()),
      type: (r.type as ShotRow['type']) ?? 'shot',
      text: String(r.text ?? ''),
      checked: Boolean(r.checked ?? false),
      ...(r.imagePath ? { imagePath: String(r.imagePath) } : {}),
      ...(r.shotSize ? { shotSize: String(r.shotSize) } : {}),
      ...(r.lens ? { lens: String(r.lens) } : {}),
      ...(r.movement ? { movement: String(r.movement) } : {}),
      ...(r.extraNotes ? { extraNotes: String(r.extraNotes) } : {}),
    })),
  }))

  return {
    id: String(data.id ?? ''),
    title: String(data.title ?? ''),
    projectId: data.projectId ? String(data.projectId) : undefined,
    shootDayId: data.shootDayId ? String(data.shootDayId) : undefined,
    moodboardImages: data.moodboardImages ?? [],
    createdAt: toDateString(data.createdAt),
    updatedAt: toDateString(data.updatedAt),
    sections,
  }
}

export function serializeShotlistFile(sl: Shotlist): string {
  const frontmatter: Record<string, unknown> = {
    id: sl.id,
    title: sl.title,
    ...(sl.projectId ? { projectId: sl.projectId } : {}),
    ...(sl.shootDayId ? { shootDayId: sl.shootDayId } : {}),
    ...(sl.moodboardImages.length ? { moodboardImages: sl.moodboardImages } : {}),
    createdAt: sl.createdAt,
    updatedAt: sl.updatedAt,
    sections: sl.sections.map((s) => ({
      id: s.id,
      name: s.name,
      color: s.color,
      collapsed: s.collapsed,
      rows: s.rows.map((r) => {
        const row: Record<string, unknown> = {
          id: r.id,
          type: r.type,
          text: r.text,
          checked: r.checked,
        }
        if (r.imagePath) row.imagePath = r.imagePath
        if (r.shotSize) row.shotSize = r.shotSize
        if (r.lens) row.lens = r.lens
        if (r.movement) row.movement = r.movement
        if (r.extraNotes) row.extraNotes = r.extraNotes
        return row
      }),
    })),
  }
  return matter.stringify('', frontmatter)
}
