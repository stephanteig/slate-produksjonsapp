import { listLoans } from './vaultService'
import type { Loan } from '../../shared/types/equipment'
import type { LoanNotification } from '../../shared/types/notification'

export type { LoanNotification }

export function getOverdueLoans(): LoanNotification[] {
  let loans: Loan[] = []
  try {
    loans = listLoans()
  } catch {
    return []
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return loans
    .filter((loan) => {
      if (loan.returned) return false
      const end = new Date(loan.endDate)
      end.setHours(0, 0, 0, 0)
      return end < today
    })
    .map((loan) => {
      const end = new Date(loan.endDate)
      end.setHours(0, 0, 0, 0)
      const diffMs = today.getTime() - end.getTime()
      const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      return {
        loanId: loan.id,
        equipmentId: loan.equipmentId,
        loanedTo: loan.loanedTo,
        endDate: loan.endDate,
        daysOverdue,
      }
    })
}
