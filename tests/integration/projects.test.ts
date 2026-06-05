import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import {
  setVaultPath,
  initVaultStructure,
  listProjects,
  saveProject,
  listShootDays,
  saveShootDay,
} from '../../src/main/services/vaultService'
import type { Project } from '../../src/shared/types/project'
import type { ShootDay } from '../../src/shared/types/calendar'

let tempDir: string

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-projects-'))
  setVaultPath(tempDir)
  initVaultStructure(tempDir)
})

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true })
  setVaultPath('')
})

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'test-id-1',
    title: 'Test Prosjekt',
    status: 'planning',
    createdAt: '2026-06-03',
    updatedAt: '2026-06-03',
    tasks: [],
    tags: ['slate'],
    ...overrides,
  }
}

describe('Opprett prosjekt', () => {
  it('oppretter fil i korrekt mappe', () => {
    const project = makeProject()
    saveProject(project)
    const dir = path.join(tempDir, 'Slate', 'projects', 'test-prosjekt')
    expect(fs.existsSync(path.join(dir, 'project.md'))).toBe(true)
    expect(fs.existsSync(path.join(dir, 'tasks.md'))).toBe(true)
  })

  it('prosjektet kan leses tilbake', () => {
    const project = makeProject()
    saveProject(project)
    const projects = listProjects()
    expect(projects.length).toBe(1)
    expect(projects[0].title).toBe('Test Prosjekt')
    expect(projects[0].status).toBe('planning')
  })
})

describe('Arkiver prosjekt', () => {
  it('endrer status til archived og beholder filen', () => {
    const project = makeProject()
    saveProject(project)
    saveProject({ ...project, status: 'archived' })

    const projects = listProjects()
    expect(projects.length).toBe(1)
    expect(projects[0].status).toBe('archived')

    const dir = path.join(tempDir, 'Slate', 'projects', 'test-prosjekt')
    expect(fs.existsSync(path.join(dir, 'project.md'))).toBe(true)
  })
})

describe('Rename prosjekt', () => {
  it('sletter gammel mappe og oppretter ny — ingen duplikater', () => {
    const project = makeProject()
    saveProject(project)

    const oldDir = path.join(tempDir, 'Slate', 'projects', 'test-prosjekt')
    expect(fs.existsSync(oldDir)).toBe(true)

    saveProject({ ...project, title: 'Nytt Prosjektnavn' })

    const newDir = path.join(tempDir, 'Slate', 'projects', 'nytt-prosjektnavn')
    expect(fs.existsSync(newDir)).toBe(true)
    expect(fs.existsSync(oldDir)).toBe(false)

    const projects = listProjects()
    expect(projects.length).toBe(1)
    expect(projects[0].title).toBe('Nytt Prosjektnavn')
  })
})

describe('Shoot-dager', () => {
  it('tillater to shoot-dager på samme dato', () => {
    const day1: ShootDay = {
      id: 'shoot-1',
      date: '2026-06-15',
      title: 'Morgen-shoot',
    }
    const day2: ShootDay = {
      id: 'shoot-2',
      date: '2026-06-15',
      title: 'Kveld-shoot',
    }
    saveShootDay(day1)
    saveShootDay(day2)

    const days = listShootDays()
    expect(days.length).toBe(2)
    const titles = days.map((d) => d.title)
    expect(titles).toContain('Morgen-shoot')
    expect(titles).toContain('Kveld-shoot')
  })

  it('oppdaterer eksisterende shoot-dag uten å lage duplikat', () => {
    const day: ShootDay = {
      id: 'shoot-upd',
      date: '2026-06-20',
      title: 'Original tittel',
    }
    saveShootDay(day)
    saveShootDay({ ...day, title: 'Oppdatert tittel' })

    const days = listShootDays()
    expect(days.length).toBe(1)
    expect(days[0].title).toBe('Oppdatert tittel')
  })
})
