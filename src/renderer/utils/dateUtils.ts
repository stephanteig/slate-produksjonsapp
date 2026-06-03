import { format, isAfter, isBefore, isEqual, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'

export function formatDisplayDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'd. MMMM yyyy', { locale: nb })
  } catch {
    return isoDate
  }
}

export function formatShortDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'dd.MM.yyyy')
  } catch {
    return isoDate
  }
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: nb })
}

export function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  const d = parseISO(date)
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  return (isAfter(d, start) || isEqual(d, start)) && (isBefore(d, end) || isEqual(d, end))
}

export function isLoanOverdue(endDate: string, returned: boolean): boolean {
  if (returned) return false
  const end = parseISO(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return isBefore(end, today)
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function today(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
