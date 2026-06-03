import { describe, it, expect } from 'vitest'
import { isDateInRange, isLoanOverdue, formatDisplayDate, toISODateString } from '../../../src/renderer/utils/dateUtils'

describe('isDateInRange', () => {
  it('returns true for a date within range', () => {
    expect(isDateInRange('2026-06-05', '2026-06-01', '2026-06-10')).toBe(true)
  })

  it('returns true for a date equal to start boundary', () => {
    expect(isDateInRange('2026-06-01', '2026-06-01', '2026-06-10')).toBe(true)
  })

  it('returns true for a date equal to end boundary', () => {
    expect(isDateInRange('2026-06-10', '2026-06-01', '2026-06-10')).toBe(true)
  })

  it('returns false for a date before range', () => {
    expect(isDateInRange('2026-05-31', '2026-06-01', '2026-06-10')).toBe(false)
  })

  it('returns false for a date after range', () => {
    expect(isDateInRange('2026-06-11', '2026-06-01', '2026-06-10')).toBe(false)
  })
})

describe('isLoanOverdue', () => {
  it('returns false when loan is returned', () => {
    expect(isLoanOverdue('2020-01-01', true)).toBe(false)
  })

  it('returns true when endDate is in the past and not returned', () => {
    expect(isLoanOverdue('2020-01-01', false)).toBe(true)
  })

  it('returns false for a future endDate', () => {
    const futureDate = '2099-12-31'
    expect(isLoanOverdue(futureDate, false)).toBe(false)
  })
})

describe('formatDisplayDate', () => {
  it('formats date in Norwegian format', () => {
    const result = formatDisplayDate('2026-06-03')
    expect(result).toBe('3. juni 2026')
  })

  it('returns raw string on invalid date', () => {
    const result = formatDisplayDate('ugyldig')
    expect(result).toBe('ugyldig')
  })
})
