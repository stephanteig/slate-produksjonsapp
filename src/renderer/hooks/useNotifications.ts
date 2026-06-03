import { useCallback, useEffect } from 'react'
import { useAppStore } from '../store/appStore'

export function useNotifications() {
  const { state, dispatch } = useAppStore()

  const refresh = useCallback(async () => {
    const result = await window.electronAPI.listNotifications()
    if (result.success) {
      dispatch({ type: 'SET_NOTIFICATIONS', notifications: result.data })
    }
  }, [dispatch])

  useEffect(() => {
    window.electronAPI.onNotificationsUpdate((data) => {
      dispatch({ type: 'SET_NOTIFICATIONS', notifications: data as typeof state.notifications })
    })
    return () => {
      window.electronAPI.removeAllListeners('notifications:update')
    }
  }, [dispatch])

  const highlightLoan = useCallback(
    (loanId: string | null) => {
      dispatch({ type: 'HIGHLIGHT_LOAN', loanId })
      if (loanId) {
        dispatch({ type: 'SET_VIEW', view: 'calendar' })
      }
    },
    [dispatch]
  )

  return {
    notifications: state.notifications,
    highlightedLoanId: state.highlightedLoanId,
    refresh,
    highlightLoan,
  }
}
