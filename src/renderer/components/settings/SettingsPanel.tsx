import React, { useState } from 'react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { VaultSettings } from './VaultSettings'
import { DataPortability } from './DataPortability'
import { OwnerManager } from '../equipment/OwnerManager'
import { useAppStore } from '../../store/appStore'

function MarkrImport() {
  const { dispatch } = useAppStore()
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleImport() {
    setLoading(true)
    setStatus(null)
    const result = await window.electronAPI.importSwshot()
    setLoading(false)
    if (result.canceled) return
    if (!result.success) {
      setStatus(`Feil: ${result.error ?? 'Ukjent feil'}`)
      return
    }
    const imported = result.data ?? []
    const listResult = await window.electronAPI.listShotlists()
    if (listResult.success) {
      dispatch({ type: 'SET_SHOTLISTS', shotlists: listResult.data! })
    }
    const errors = result.errors?.length ? ` (${result.errors.length} feil)` : ''
    setStatus(`${imported.length} shotlist${imported.length !== 1 ? 'er' : ''} importert${errors}.`)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Importer fra Markr</h3>
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Les inn .swshot-filer fra Markr og konverter dem til Slate-shotlister.
        Shotlistene legges til i «Shotlister»-visningen.
      </p>
      <button onClick={handleImport} disabled={loading} className="btn-secondary text-sm">
        {loading ? 'Importerer…' : 'Velg .swshot-filer'}
      </button>
      {status && (
        <p className="text-xs" style={{ color: status.startsWith('Feil') ? '#ef4444' : 'var(--color-accent)' }}>
          {status}
        </p>
      )}
    </div>
  )
}

export function SettingsPanel() {
  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-2xl space-y-10">
        <section>
          <ThemeSwitcher />
        </section>

        <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />

        <section>
          <VaultSettings />
        </section>

        <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />

        <section>
          <OwnerManager />
        </section>

        <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />

        <section>
          <MarkrImport />
        </section>

        <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />

        <section>
          <DataPortability />
        </section>
      </div>
    </div>
  )
}
