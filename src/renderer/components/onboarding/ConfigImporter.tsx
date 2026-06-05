import React, { useState } from 'react'
import type { SlateConfig } from '../../../shared/types/config'

interface ConfigImporterProps {
  onImported: (config: SlateConfig) => void
  onSkip: () => void
}

export function ConfigImporter({ onImported, onSkip }: ConfigImporterProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleImport() {
    setError(null)
    setLoading(true)
    try {
      const result = await window.electronAPI.importData()
      if (!result.success) {
        if (!result.canceled) {
          setError(result.error ?? 'Kunne ikke lese eksportfilen.')
        }
        return
      }
      onImported(result.config)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p style={{ color: 'var(--color-text-muted)' }}>
        Har du brukt Slate på en annen maskin? Du kan importere dine eksisterende data fra en
        eksportert ZIP-fil (inneholder{' '}
        <code className="rounded px-1 py-0.5 text-xs" style={{ background: 'var(--color-border)' }}>
          slate-config.json
        </code>{' '}
        + Slate-mappen).
      </p>

      {error && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'rgba(220,38,38,0.08)',
            borderColor: 'rgba(220,38,38,0.3)',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleImport}
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading ? 'Importerer…' : 'Importer slate-eksport (.zip)'}
        </button>
        <button onClick={onSkip} className="btn-secondary">
          Start fra scratch
        </button>
      </div>
    </div>
  )
}
