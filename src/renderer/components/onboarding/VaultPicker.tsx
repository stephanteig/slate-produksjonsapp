import React, { useState } from 'react'

interface VaultPickerProps {
  initialPath: string
  onNext: (vaultPath: string) => void
}

export function VaultPicker({ initialPath, onNext }: VaultPickerProps) {
  const [vaultPath, setVaultPath] = useState(initialPath)
  const [warning, setWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  async function handlePickFolder() {
    setError(null)
    const picked = await window.electronAPI.pickFolder()
    if (picked) {
      setVaultPath(picked)
      setWarning(null)
    }
  }

  async function handleImportSlateDir() {
    if (!vaultPath) {
      setError('Velg en vault-mappe først.')
      return
    }
    setImporting(true)
    setError(null)
    try {
      const result = await window.electronAPI.importSlateDir(vaultPath)
      if (!result.success && !result.canceled) {
        setError(result.error ?? 'Kunne ikke importere Slate-mappen.')
      }
    } finally {
      setImporting(false)
    }
  }

  function handleNext() {
    if (!vaultPath) {
      setError('Du må velge en vault-mappe for å fortsette.')
      return
    }
    onNext(vaultPath)
  }

  return (
    <div className="space-y-4">
      <p style={{ color: 'var(--color-text-muted)' }}>
        Velg hvilken mappe Slate skal bruke som vault-root. Appen oppretter en{' '}
        <code className="rounded px-1 py-0.5 text-xs" style={{ background: 'var(--color-border)' }}>
          /Slate/
        </code>{' '}
        undermappe der alle dine data lagres som Markdown.
      </p>

      <div className="flex gap-2">
        <button
          onClick={handlePickFolder}
          className="btn-secondary flex-1 truncate text-left"
        >
          {vaultPath ? (
            <span className="font-mono text-xs">{vaultPath}</span>
          ) : (
            'Velg mappe…'
          )}
        </button>
        <button onClick={handlePickFolder} className="btn-primary whitespace-nowrap">
          Bla gjennom
        </button>
      </div>

      {warning && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'rgba(234,179,8,0.08)',
            borderColor: 'rgba(234,179,8,0.3)',
            color: '#eab308',
          }}
        >
          {warning}
        </div>
      )}

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

      <div className="flex items-center gap-3">
        <button
          onClick={handleImportSlateDir}
          disabled={importing || !vaultPath}
          className="btn-secondary text-sm"
        >
          {importing ? 'Importerer…' : 'Importer eksisterende /Slate/-mappe'}
        </button>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleNext} disabled={!vaultPath} className="btn-primary">
          Gå videre
        </button>
      </div>
    </div>
  )
}
