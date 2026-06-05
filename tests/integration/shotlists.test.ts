import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { setVaultPath, initVaultStructure, listShotlists, saveShotlist, deleteShotlist } from '../../src/main/services/vaultService'
import type { Shotlist } from '../../src/shared/types/shotlist'

let tmpDir: string

function makeTestShotlist(overrides: Partial<Shotlist> = {}): Shotlist {
  return {
    id: crypto.randomUUID(),
    title: 'Test Shotlist',
    moodboardImages: [],
    createdAt: '2026-06-05',
    updatedAt: '2026-06-05',
    sections: [
      {
        id: crypto.randomUUID(),
        name: 'Scene 1',
        color: '#4f8ef7',
        collapsed: false,
        rows: [
          { id: crypto.randomUUID(), type: 'shot', text: 'Åpningsshot', checked: false },
          { id: crypto.randomUUID(), type: 'note', text: 'Notat her', checked: false },
        ],
      },
    ],
    ...overrides,
  }
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-test-'))
  setVaultPath(tmpDir)
  initVaultStructure(tmpDir)
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('saveShotlist', () => {
  it('creates a .md file in Slate/shotlists/', () => {
    const sl = makeTestShotlist()
    saveShotlist(sl)
    const shotlistsDir = path.join(tmpDir, 'Slate', 'shotlists')
    const files = fs.readdirSync(shotlistsDir).filter((f) => f.endsWith('.md'))
    expect(files).toHaveLength(1)
    expect(files[0]).toContain(sl.id)
  })

  it('deletes old file and creates new one when title (slug) changes', () => {
    const sl = makeTestShotlist({ title: 'Gammelt navn' })
    saveShotlist(sl)
    const shotlistsDir = path.join(tmpDir, 'Slate', 'shotlists')
    const before = fs.readdirSync(shotlistsDir).filter((f) => f.endsWith('.md'))
    expect(before[0]).toContain('gammelt-navn')

    saveShotlist({ ...sl, title: 'Nytt navn' })
    const after = fs.readdirSync(shotlistsDir).filter((f) => f.endsWith('.md'))
    expect(after).toHaveLength(1)
    expect(after[0]).toContain('nytt-navn')
    expect(after[0]).not.toContain('gammelt-navn')
  })
})

describe('listShotlists', () => {
  it('returns all saved shotlists correctly parsed', () => {
    const sl1 = makeTestShotlist({ title: 'First' })
    const sl2 = makeTestShotlist({ title: 'Second' })
    saveShotlist(sl1)
    saveShotlist(sl2)
    const list = listShotlists()
    expect(list).toHaveLength(2)
    const titles = list.map((s) => s.title).sort()
    expect(titles).toEqual(['First', 'Second'])
  })
})

describe('deleteShotlist', () => {
  it('removes the .md file', () => {
    const sl = makeTestShotlist()
    saveShotlist(sl)
    const shotlistsDir = path.join(tmpDir, 'Slate', 'shotlists')
    expect(fs.readdirSync(shotlistsDir).filter((f) => f.endsWith('.md'))).toHaveLength(1)
    deleteShotlist(sl.id)
    expect(fs.readdirSync(shotlistsDir).filter((f) => f.endsWith('.md'))).toHaveLength(0)
  })

  it('also deletes the image directory if it exists', () => {
    const sl = makeTestShotlist()
    saveShotlist(sl)
    const imgDir = path.join(tmpDir, 'Slate', 'shotlists', sl.id)
    fs.mkdirSync(path.join(imgDir, 'storyboard'), { recursive: true })
    expect(fs.existsSync(imgDir)).toBe(true)
    deleteShotlist(sl.id)
    expect(fs.existsSync(imgDir)).toBe(false)
  })
})
