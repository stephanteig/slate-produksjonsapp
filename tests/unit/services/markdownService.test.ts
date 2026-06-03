import { describe, it, expect } from 'vitest'
import {
  parseProjectFile,
  serializeProjectFile,
  parseEquipmentFile,
  serializeLoanFile,
  parseLoanFile,
  parseTasksFile,
  serializeTasksFile,
} from '../../../src/main/services/markdownService'
import type { Project } from '../../../src/shared/types/project'
import type { Loan } from '../../../src/shared/types/equipment'

describe('parseProjectFile', () => {
  it('parses frontmatter correctly', () => {
    const content = `---
id: abc-123
title: Test Prosjekt
status: in-progress
dropbox: https://dropbox.com/test
created: 2026-06-01
updated: 2026-06-03
tags: [slate]
---
`
    const result = parseProjectFile(content)
    expect(result.id).toBe('abc-123')
    expect(result.title).toBe('Test Prosjekt')
    expect(result.status).toBe('in-progress')
    expect(result.dropboxUrl).toBe('https://dropbox.com/test')
    expect(result.createdAt).toBe('2026-06-01')
  })

  it('defaults status to planning if missing', () => {
    const content = `---
id: xyz
title: Test
created: 2026-01-01
updated: 2026-01-01
---
`
    const result = parseProjectFile(content)
    expect(result.status).toBe('planning')
  })
})

describe('serializeProjectFile', () => {
  it('produces valid frontmatter', () => {
    const project: Omit<Project, 'tasks'> = {
      id: 'test-id',
      title: 'Mitt prosjekt',
      status: 'planning',
      createdAt: '2026-06-01',
      updatedAt: '2026-06-03',
      tags: ['slate'],
    }
    const result = serializeProjectFile(project)
    expect(result).toContain('id: test-id')
    expect(result).toContain('title: Mitt prosjekt')
    expect(result).toContain('status: planning')
  })
})

describe('parseEquipmentFile', () => {
  it('maps all fields correctly', () => {
    const content = `---
id: eq-1
name: Sony FX3
category: Kamera
ownerId: owner-1
serialNumber: ABC123
purchasePrice: 45000
status: available
created: 2026-06-01
---

Notater her.
`
    const result = parseEquipmentFile(content)
    expect(result.id).toBe('eq-1')
    expect(result.name).toBe('Sony FX3')
    expect(result.category).toBe('Kamera')
    expect(result.ownerId).toBe('owner-1')
    expect(result.serialNumber).toBe('ABC123')
    expect(result.purchasePrice).toBe(45000)
    expect(result.status).toBe('available')
    expect(result.notes).toBe('Notater her.')
  })
})

describe('serializeLoanFile', () => {
  it('uses ISO 8601 date format', () => {
    const loan: Loan = {
      id: 'loan-1',
      equipmentId: 'eq-1',
      loanedTo: 'Ola Nordmann',
      startDate: '2026-06-10',
      endDate: '2026-06-12',
      returned: false,
    }
    const result = serializeLoanFile(loan)
    // Verify dates survive a parse roundtrip correctly
    const parsed = parseLoanFile(result)
    expect(parsed.startDate).toBe('2026-06-10')
    expect(parsed.endDate).toBe('2026-06-12')
    expect(parsed.returned).toBe(false)
  })
})

describe('parseTasksFile / serializeTasksFile roundtrip', () => {
  it('preserves tasks and subtasks', () => {
    const projectId = 'proj-1'
    const tasks = [
      {
        id: 't1',
        title: 'Råklipp',
        completed: false,
        createdAt: '2026-06-01',
        subtasks: [
          { id: 's1', title: 'Scene 1', completed: true, createdAt: '2026-06-01' },
        ],
      },
    ]
    const serialized = serializeTasksFile(projectId, tasks)
    const parsed = parseTasksFile(serialized)
    expect(parsed.length).toBe(1)
    expect(parsed[0].title).toBe('Råklipp')
    expect(parsed[0].completed).toBe(false)
    expect(parsed[0].subtasks?.length).toBe(1)
    expect(parsed[0].subtasks?.[0].title).toBe('Scene 1')
    expect(parsed[0].subtasks?.[0].completed).toBe(true)
  })
})
