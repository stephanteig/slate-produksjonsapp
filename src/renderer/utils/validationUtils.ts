export function isValidDropboxUrl(url: string): boolean {
  if (!url) return true
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function isPositiveNumber(value: number | undefined): boolean {
  if (value === undefined) return true
  return value >= 0
}
