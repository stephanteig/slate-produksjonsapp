import { useCallback } from 'react'
import { useAppStore } from '../store/appStore'
import type { Equipment } from '../../shared/types/equipment'

export function useEquipment() {
  const { state, dispatch } = useAppStore()

  const refresh = useCallback(async () => {
    const result = await window.electronAPI.listEquipment()
    if (result.success) {
      dispatch({ type: 'SET_EQUIPMENT', equipment: result.data })
    }
  }, [dispatch])

  const saveEquipment = useCallback(
    async (equipment: Equipment): Promise<{ success: boolean; error?: string }> => {
      const result = await window.electronAPI.saveEquipment(equipment)
      if (result.success) await refresh()
      return result
    },
    [refresh]
  )

  const deleteEquipment = useCallback(
    async (equipmentId: string): Promise<{ success: boolean; error?: string }> => {
      const result = await window.electronAPI.deleteEquipment(equipmentId)
      if (result.success) await refresh()
      return result
    },
    [refresh]
  )

  return {
    equipment: state.equipment,
    refresh,
    saveEquipment,
    deleteEquipment,
  }
}
