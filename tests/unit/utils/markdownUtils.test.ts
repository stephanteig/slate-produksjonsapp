import { describe, it, expect } from 'vitest'
import { slugify, generateId } from '../../../src/renderer/utils/markdownUtils'

describe('slugify', () => {
  it('converts Norwegian characters', () => {
    expect(slugify('Kamera æøå')).toBe('kamera-aeoeaa')
  })

  it('removes special characters', () => {
    expect(slugify('Hello World!')).toBe('hello-world')
  })

  it('handles emojis', () => {
    expect(slugify('Test 🎬')).toBe('test')
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugify('--test--')).toBe('test')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('truncates long strings at 80 chars', () => {
    const long = 'a'.repeat(100)
    expect(slugify(long).length).toBe(80)
  })
})

describe('generateId', () => {
  it('generates a UUID string', () => {
    const id = generateId()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, generateId))
    expect(ids.size).toBe(100)
  })
})
