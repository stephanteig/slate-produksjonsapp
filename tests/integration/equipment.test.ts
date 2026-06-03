import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import {
  setVaultPath,
  initVaultStructure,
  listEquipment,
  saveEquipment,
} from '../../src/main/services/vaultService'
import type { Equipment } from '../../src/shared/types/equipment'

let tempDir: string

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-equipment-'))
  setVaultPath(tempDir)
  initVaultStructure(tempDir)
})

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true })
  setVaultPath('')
})

describe('Utstyr med eier', () => {
  it('lagrer ownerId korrekt i Markdown-filen', () => {
    const eq: Equipment = {
      id: 'eq-1',
      name: 'Sony FX3',
      category: 'Kamera',
      ownerId: 'owner-uuid-123',
      status: 'available',
      createdAt: '2026-06-03',
    }
    saveEquipment(eq)
    const items = listEquipment()
    expect(items.length).toBe(1)
    expect(items[0].ownerId).toBe('owner-uuid-123')
    expect(items[0].name).toBe('Sony FX3')
  })
})
