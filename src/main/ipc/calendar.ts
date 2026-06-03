import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import {
  listShootDays,
  saveShootDay,
  deleteShootDay,
  listLoans,
  saveLoan,
  returnLoan,
  listEquipment,
} from '../services/vaultService'
import type { ShootDay } from '../../shared/types/calendar'
import type { Loan } from '../../shared/types/equipment'

export function registerCalendarHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.CALENDAR_LIST, () => {
    try {
      return { success: true, data: listShootDays() }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.CALENDAR_SAVE, (_, day: ShootDay) => {
    try {
      saveShootDay(day)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.CALENDAR_DELETE, (_, dayId: string) => {
    try {
      deleteShootDay(dayId)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.LOANS_LIST, () => {
    try {
      return { success: true, data: listLoans() }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.LOANS_SAVE, (_, loan: Loan) => {
    try {
      // Check for overlapping loans for the same equipment
      const existing = listLoans().filter(
        (l) => l.equipmentId === loan.equipmentId && !l.returned && l.id !== loan.id
      )
      const newStart = new Date(loan.startDate)
      const newEnd = new Date(loan.endDate)

      if (newEnd < newStart) {
        return { success: false, error: 'Sluttdato kan ikke være før startdato.' }
      }

      for (const existing_loan of existing) {
        const existStart = new Date(existing_loan.startDate)
        const existEnd = new Date(existing_loan.endDate)
        const overlaps = newStart <= existEnd && newEnd >= existStart
        if (overlaps) {
          return {
            success: false,
            error: `Overlappende utlånsperiode: utstyret er allerede utlånt fra ${existing_loan.startDate} til ${existing_loan.endDate} til ${existing_loan.loanedTo}.`,
          }
        }
      }

      const equipment = listEquipment().find((e) => e.id === loan.equipmentId)
      const equipmentName = equipment?.name ?? loan.equipmentId
      saveLoan(loan, equipmentName)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.LOANS_RETURN, (_, loanId: string) => {
    try {
      returnLoan(loanId)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
