import React, { useState } from 'react'
import { useAppStore } from '../../store/appStore'

export function VaultSettings() {
  const { state, dispatch } = useAppStore()
  const [changing, setChanging] = useState(false)
  const [error, setError] = useState('')

  async function handleChangeVault() {
    setError('')
    const newPath = await window.electronAPI.pickFolder()
    if (!newPath) return

    setChanging(true)
    const initResult = await window.electronAPI.initVault(newPath)
    if (!initResult.success) {
      setError(initResult.error ?? 'Kunne ikke opprette vault-struktur.')
      setChanging(false)
      return
    }

    if (state.config) {
      const updated = { ...state.config, vaultPath: newPath }
      await window.electronAPI.saveConfig(updated)
      dispatch({ type: 'SET_CONFIG', config: updated })
    }
    setChanging(false)
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Vault-mappe</h3>
      <div className="flex items-center gap-3">
        <code className="flex-1 rounded px-3 py-2 text-xs font-mono overflow-x-auto" style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
          {state.config?.vaultPath || 'Ingen vault valgt'}
        </code>
        <button onClick={handleChangeVault} disabled={changing} className="btn-secondary text-sm whitespace-nowrap">
          {changing ? 'Endrer…' : 'Bytt mappe'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  )
}
