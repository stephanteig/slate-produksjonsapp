import { useCallback } from 'react'
import { useAppStore } from '../store/appStore'
import type { Kit } from '../../shared/types/kit'

export function useKits() {
  const { state, dispatch } = useAppStore()

  const refresh = useCallback(async () => {
    const result = await window.electronAPI.listKits()
    if (result.success) {
      dispatch({ type: 'SET_KITS', kits: result.data })
    }
  }, [dispatch])

  const saveKit = useCallback(
    async (kit: Kit): Promise<{ success: boolean; error?: string }> => {
      const result = await window.electronAPI.saveKit(kit)
      if (result.success) await refresh()
      return result
    },
    [refresh]
  )

  const deleteKit = useCallback(
    async (kitId: string): Promise<{ success: boolean; error?: string }> => {
      const result = await window.electronAPI.deleteKit(kitId)
      if (result.success) await refresh()
      return result
    },
    [refresh]
  )

  return { kits: state.kits, refresh, saveKit, deleteKit }
}
