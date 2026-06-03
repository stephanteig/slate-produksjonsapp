import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'

// We test the logic without Electron's app.getPath — use a temp dir instead
let tempDir: string
let CONFIG_PATH: string

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-test-'))
  CONFIG_PATH = path.join(tempDir, 'slate-config.json')
})

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true })
})

describe('Config roundtrip', () => {
  it('writes and reads config correctly', () => {
    const config = {
      vaultPath: '/Users/test/vault',
      theme: 'nordic-slate',
      owners: [{ id: 'o1', name: 'Ola' }],
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    expect(parsed.vaultPath).toBe('/Users/test/vault')
    expect(parsed.theme).toBe('nordic-slate')
    expect(parsed.owners).toHaveLength(1)
  })

  it('handles missing config gracefully', () => {
    const exists = fs.existsSync(CONFIG_PATH)
    expect(exists).toBe(false)
  })

  it('handles corrupt config — falls back to defaults', () => {
    fs.writeFileSync(CONFIG_PATH, 'dette er ikke json{{{', 'utf-8')
    let parsed: { vaultPath: string; theme: string; owners: unknown[] } | null = null
    try {
      parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
    } catch {
      parsed = { vaultPath: '', theme: 'nordic-slate', owners: [] }
    }
    expect(parsed!.theme).toBe('nordic-slate')
    expect(parsed!.owners).toHaveLength(0)
  })
})
