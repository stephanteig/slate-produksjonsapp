export interface LoanNotification {
  loanId: string
  equipmentId: string
  loanedTo: string
  endDate: string
  daysOverdue: number
}
