import { useCallback } from 'react'
import { useAppStore } from '../store/appStore'
import type { Shotlist } from '../../shared/types/shotlist'

export function useShotlists() {
  const { state, dispatch } = useAppStore()

  const refreshShotlists = useCallback(async () => {
    const result = await window.electronAPI.listShotlists()
    if (result.success) dispatch({ type: 'SET_SHOTLISTS', shotlists: result.data! })
  }, [dispatch])

  const saveShotlist = useCallback(
    async (sl: Shotlist) => {
      const result = await window.electronAPI.saveShotlist(sl)
      if (result.success) {
        dispatch({
          type: 'SET_SHOTLISTS',
          shotlists: state.shotlists.some((s) => s.id === sl.id)
            ? state.shotlists.map((s) => (s.id === sl.id ? sl : s))
            : [...state.shotlists, sl],
        })
      }
      return result
    },
    [state.shotlists, dispatch]
  )

  const deleteShotlist = useCallback(
    async (id: string) => {
      const result = await window.electronAPI.deleteShotlist(id)
      if (result.success) {
        dispatch({
          type: 'SET_SHOTLISTS',
          shotlists: state.shotlists.filter((s) => s.id !== id),
        })
      }
      return result
    },
    [state.shotlists, dispatch]
  )

  return { shotlists: state.shotlists, refreshShotlists, saveShotlist, deleteShotlist }
}
