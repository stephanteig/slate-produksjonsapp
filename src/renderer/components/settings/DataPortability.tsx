import React, { useState } from 'react'
import { useAppStore } from '../../store/appStore'

export function DataPortability() {
  const { state, dispatch } = useAppStore()
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleExport() {
    if (!state.config?.vaultPath) return
    setExportStatus('loading')
    const result = await window.electronAPI.exportData(state.config.vaultPath)
    if (result.success) {
      setExportStatus('done')
      setMessage('Data eksportert!')
    } else if (!result.canceled) {
      setExportStatus('error')
      setMessage(result.error ?? 'Eksport feilet.')
    } else {
      setExportStatus('idle')
    }
    setTimeout(() => { setExportStatus('idle'); setMessage('') }, 3000)
  }

  async function handleImport() {
    setImportStatus('loading')
    const result = await window.electronAPI.importData()
    if (result.success) {
      dispatch({ type: 'SET_CONFIG', config: result.config })
      setImportStatus('done')
      setMessage('Data importert! Start appen på nytt for å laste inn alt.')
    } else if (!result.canceled) {
      setImportStatus('error')
      setMessage(result.error ?? 'Import feilet.')
    } else {
      setImportStatus('idle')
    }
    setTimeout(() => { setImportStatus('idle'); setMessage('') }, 5000)
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Dataportabilitet</h3>
      <p className="mb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Eksporter alle dine data (konfigurasjon + Slate-mappen) til en ZIP-fil for sikkerhetskopiering eller bruk på en annen maskin.
      </p>
      <div className="flex gap-3">
        <button onClick={handleExport} disabled={exportStatus === 'loading' || !state.config?.vaultPath} className="btn-primary text-sm">
          {exportStatus === 'loading' ? 'Eksporterer…' : 'Eksporter data'}
        </button>
        <button onClick={handleImport} disabled={importStatus === 'loading'} className="btn-secondary text-sm">
          {importStatus === 'loading' ? 'Importerer…' : 'Importer data'}
        </button>
      </div>
      {message && (
        <p className="mt-2 text-sm" style={{ color: exportStatus === 'error' || importStatus === 'error' ? '#ef4444' : 'var(--color-accent)' }}>
          {message}
        </p>
      )}
    </div>
  )
}
