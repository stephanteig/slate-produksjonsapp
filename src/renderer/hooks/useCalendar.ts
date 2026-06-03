import { useCallback } from 'react'
import { useAppStore } from '../store/appStore'
import type { ShootDay } from '../../shared/types/calendar'
import type { Loan } from '../../shared/types/equipment'

export function useCalendar() {
  const { state, dispatch } = useAppStore()

  const refreshShootDays = useCallback(async () => {
    const result = await window.electronAPI.listShootDays()
    if (result.success) {
      dispatch({ type: 'SET_SHOOT_DAYS', shootDays: result.data })
    }
  }, [dispatch])

  const refreshLoans = useCallback(async () => {
    const result = await window.electronAPI.listLoans()
    if (result.success) {
      dispatch({ type: 'SET_LOANS', loans: result.data })
    }
  }, [dispatch])

  const saveShootDay = useCallback(
    async (day: ShootDay): Promise<{ success: boolean; error?: string }> => {
      const result = await window.electronAPI.saveShootDay(day)
      if (result.success) await refreshShootDays()
      return result
    },
    [refreshShootDays]
  )

  const deleteShootDay = useCallback(
    async (dayId: string): Promise<{ success: boolean; error?: string }> => {
      const result = await window.electronAPI.deleteShootDay(dayId)
      if (result.success) await refreshShootDays()
      return result
    },
    [refreshShootDays]
  )

  const saveLoan = useCallback(
    async (loan: Loan): Promise<{ success: boolean; error?: string }> => {
      const result = await window.electronAPI.saveLoan(loan)
      if (result.success) {
        await refreshLoans()
        const eqResult = await window.electronAPI.listEquipment()
        if (eqResult.success) dispatch({ type: 'SET_EQUIPMENT', equipment: eqResult.data })
      }
      return result
    },
    [refreshLoans, dispatch]
  )

  const returnLoan = useCallback(
    async (loanId: string): Promise<{ success: boolean; error?: string }> => {
      const result = await window.electronAPI.returnLoan(loanId)
      if (result.success) {
        await refreshLoans()
        const eqResult = await window.electronAPI.listEquipment()
        if (eqResult.success) dispatch({ type: 'SET_EQUIPMENT', equipment: eqResult.data })
      }
      return result
    },
    [refreshLoans, dispatch]
  )

  return {
    shootDays: state.shootDays,
    loans: state.loans,
    refreshShootDays,
    refreshLoans,
    saveShootDay,
    deleteShootDay,
    saveLoan,
    returnLoan,
  }
}
