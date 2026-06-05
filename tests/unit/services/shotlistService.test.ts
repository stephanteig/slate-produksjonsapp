import { describe, it, expect } from 'vitest'
import { parseShotlistFile, serializeShotlistFile } from '../../../src/main/services/markdownService'
import type { Shotlist } from '../../../src/shared/types/shotlist'

const SAMPLE: Shotlist = {
  id: 'sl-1',
  title: 'Test Shotlist',
  projectId: 'proj-1',
  moodboardImages: ['Slate/shotlists/sl-1/moodboard/a.jpg'],
  createdAt: '2026-06-05',
  updatedAt: '2026-06-05',
  sections: [
    {
      id: 'sec-1',
      name: 'Åpning',
      color: '#4f8ef7',
      collapsed: false,
      rows: [
        {
          id: 'row-1',
          type: 'shot',
          text: 'Wide establishing shot',
          checked: false,
          shotSize: 'Vidvinkel',
          lens: '24mm',
          movement: 'Dolly inn',
          extraNotes: 'Gyllen time',
          imagePath: 'Slate/shotlists/sl-1/storyboard/row-1.jpg',
        },
        {
          id: 'row-2',
          type: 'note',
          text: 'Husk ekstra batteri',
          checked: false,
        },
        {
          id: 'row-3',
          type: 'quote',
          text: 'Sitatttekst her',
          checked: false,
        },
      ],
    },
  ],
}

describe('parseShotlistFile', () => {
  it('parses frontmatter with sections and rows', () => {
    const serialized = serializeShotlistFile(SAMPLE)
    const parsed = parseShotlistFile(serialized)
    expect(parsed.id).toBe('sl-1')
    expect(parsed.title).toBe('Test Shotlist')
    expect(parsed.projectId).toBe('proj-1')
    expect(parsed.sections).toHaveLength(1)
    expect(parsed.sections[0].name).toBe('Åpning')
    expect(parsed.sections[0].rows).toHaveLength(3)
  })

  it('parses shot with all detail fields', () => {
    const serialized = serializeShotlistFile(SAMPLE)
    const parsed = parseShotlistFile(serialized)
    const row = parsed.sections[0].rows[0]
    expect(row.type).toBe('shot')
    expect(row.shotSize).toBe('Vidvinkel')
    expect(row.lens).toBe('24mm')
    expect(row.movement).toBe('Dolly inn')
    expect(row.extraNotes).toBe('Gyllen time')
    expect(row.imagePath).toBe('Slate/shotlists/sl-1/storyboard/row-1.jpg')
  })

  it('handles empty sections array without crashing', () => {
    const sl: Shotlist = { ...SAMPLE, sections: [] }
    const serialized = serializeShotlistFile(sl)
    const parsed = parseShotlistFile(serialized)
    expect(parsed.sections).toEqual([])
  })

  it('handles missing optional fields gracefully', () => {
    const content = `---\nid: sl-min\ntitle: Minimal\ncreatedAt: 2026-06-05\nupdatedAt: 2026-06-05\nsections:\n  - id: sec-1\n    name: Intro\n    color: '#4f8ef7'\n    collapsed: false\n    rows:\n      - id: row-1\n        type: shot\n        text: Shot uten detaljer\n        checked: false\n---\n`
    const parsed = parseShotlistFile(content)
    expect(parsed.sections[0].rows[0].shotSize).toBeUndefined()
    expect(parsed.sections[0].rows[0].lens).toBeUndefined()
    expect(parsed.sections[0].rows[0].movement).toBeUndefined()
  })
})

describe('serializeShotlistFile', () => {
  it('produces valid YAML with nested sections', () => {
    const serialized = serializeShotlistFile(SAMPLE)
    expect(serialized).toContain('id: sl-1')
    expect(serialized).toContain('title: Test Shotlist')
    expect(serialized).toContain('Åpning')
    expect(serialized).toContain('Wide establishing shot')
  })

  it('round-trips through parse/serialize preserving all fields', () => {
    const serialized = serializeShotlistFile(SAMPLE)
    const parsed = parseShotlistFile(serialized)
    expect(parsed.id).toBe(SAMPLE.id)
    expect(parsed.title).toBe(SAMPLE.title)
    expect(parsed.sections[0].rows[0].text).toBe(SAMPLE.sections[0].rows[0].text)
    expect(parsed.sections[0].rows[0].shotSize).toBe('Vidvinkel')
    expect(parsed.moodboardImages).toEqual(SAMPLE.moodboardImages)
  })

  it('omits undefined optional fields from output', () => {
    const minimal: Shotlist = {
      id: 'sl-2',
      title: 'Minimal',
      moodboardImages: [],
      createdAt: '2026-06-05',
      updatedAt: '2026-06-05',
      sections: [],
    }
    const serialized = serializeShotlistFile(minimal)
    expect(serialized).not.toContain('projectId')
    expect(serialized).not.toContain('shootDayId')
    expect(serialized).not.toContain('moodboardImages')
  })
})
