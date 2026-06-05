import { useEffect, useCallback } from 'react'
import { useAppStore } from '../store/appStore'
import { DEFAULT_THEME, THEMES } from '../../shared/constants'

export function useTheme() {
  const { state, dispatch } = useAppStore()
  const rawTheme = state.config?.theme ?? DEFAULT_THEME
  const theme = (THEMES as readonly string[]).includes(rawTheme) ? rawTheme : DEFAULT_THEME

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = useCallback(
    async (newTheme: string) => {
      document.documentElement.setAttribute('data-theme', newTheme)
      if (state.config) {
        const updated = { ...state.config, theme: newTheme }
        dispatch({ type: 'SET_CONFIG', config: updated })
        await window.electronAPI.saveConfig(updated)
      }
    },
    [state.config, dispatch]
  )

  return { theme, setTheme }
}
