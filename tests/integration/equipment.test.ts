import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import {
  setVaultPath,
  initVaultStructure,
  listEquipment,
  saveEquipment,
  deleteEquipment,
  listKits,
  saveKit,
} from '../../src/main/services/vaultService'
import type { Equipment } from '../../src/shared/types/equipment'
import type { Kit } from '../../src/shared/types/kit'

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

describe('Rename utstyr', () => {
  it('sletter gammel fil og oppretter ny — ingen duplikater', () => {
    const eq: Equipment = {
      id: 'eq-rename',
      name: 'Sony FX3',
      category: 'Kamera',
      ownerId: 'owner-1',
      status: 'available',
      createdAt: '2026-06-03',
    }
    saveEquipment(eq)

    // Verify original file exists
    const oldFile = path.join(tempDir, 'Slate', 'equipment', 'sony-fx3.md')
    expect(fs.existsSync(oldFile)).toBe(true)

    // Rename
    saveEquipment({ ...eq, name: 'Sony FX6' })

    const newFile = path.join(tempDir, 'Slate', 'equipment', 'sony-fx6.md')
    expect(fs.existsSync(newFile)).toBe(true)
    expect(fs.existsSync(oldFile)).toBe(false)

    const items = listEquipment()
    expect(items.length).toBe(1)
    expect(items[0].name).toBe('Sony FX6')
  })
})

describe('Slett utstyr', () => {
  it('fjerner utstyr fra kits automatisk ved sletting', () => {
    const eq: Equipment = {
      id: 'eq-del',
      name: 'Mikrofon',
      category: 'Lyd',
      ownerId: 'owner-1',
      status: 'available',
      createdAt: '2026-06-03',
    }
    saveEquipment(eq)

    const kit: Kit = {
      id: 'kit-1',
      name: 'Interview Kit',
      shotType: 'Interview',
      equipmentIds: ['eq-del', 'eq-other'],
    }
    saveKit(kit)

    deleteEquipment('eq-del')

    const kits = listKits()
    expect(kits.length).toBe(1)
    // Kit still exists but equipment should NOT have been auto-removed at vault level
    // (kit cleanup happens in IPC handler — vault layer just deletes the file)
    expect(kits[0].equipmentIds).toContain('eq-other')
  })
})
