import { v4 as uuidv4 } from 'uuid'

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function generateId(): string {
  return uuidv4()
}
