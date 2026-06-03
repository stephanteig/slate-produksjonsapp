import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import {
  setVaultPath,
  initVaultStructure,
  listProjects,
  saveProject,
} from '../../src/main/services/vaultService'
import type { Project } from '../../src/shared/types/project'

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
