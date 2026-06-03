import React, { useState, useEffect } from 'react'
import { ConfigImporter } from './ConfigImporter'
import { VaultPicker } from './VaultPicker'
import { ThemePicker } from './ThemePicker'
import { useAppStore } from '../../store/appStore'
import { DEFAULT_THEME } from '../../../shared/constants'
import type { SlateConfig } from '../../../shared/types/config'

type Step = 1 | 2 | 3

export function OnboardingFlow() {
  const { dispatch } = useAppStore()
  const [step, setStep] = useState<Step>(1)
  const [importedConfig, setImportedConfig] = useState<Partial<SlateConfig>>({})
  const [vaultPath, setVaultPath] = useState('')
  const [theme, setTheme] = useState(DEFAULT_THEME)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  function handleConfigImported(config: SlateConfig) {
    setImportedConfig(config)
    setVaultPath(config.vaultPath ?? '')
    setTheme(config.theme ?? DEFAULT_THEME)
    setStep(2)
  }

  function handleSkipImport() {
    setStep(2)
  }

  async function handleVaultChosen(chosenPath: string) {
    setVaultPath(chosenPath)
    setStep(3)
  }

  async function handleFinish() {
    setSaving(true)
    setError(null)
    try {
      const initResult = await window.electronAPI.initVault(vaultPath)
      if (!initResult.success) {
        setError(initResult.error ?? 'Kunne ikke opprette vault-struktur.')
        setSaving(false)
        return
      }

      const config: SlateConfig = {
        vaultPath,
        theme,
        owners: importedConfig.owners ?? [],
      }

      const saveResult = await window.electronAPI.saveConfig(config)
      if (!saveResult.success) {
        setError(saveResult.error ?? 'Kunne ikke lagre konfigurasjon.')
        setSaving(false)
        return
      }

      dispatch({ type: 'SET_CONFIG', config })
      dispatch({ type: 'SET_VIEW', view: 'projects' })
    } catch (err) {
      setError(String(err))
      setSaving(false)
    }
  }

  return (
    <div
      className="flex h-full items-center justify-center p-8"
      style={{ background: 'var(--color-bg)' }}
    >
      <div
        className="w-full max-w-xl rounded-2xl border p-8 shadow-xl"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-3">
          {([1, 2, 3] as const).map((s) => (
            <React.Fragment key={s}>
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  background: s === step ? 'var(--color-accent)' : 'var(--color-border)',
                  color: s === step ? 'var(--color-bg)' : 'var(--color-text-muted)',
                }}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className="h-px flex-1"
                  style={{ background: 'var(--color-border)' }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        {step === 1 && (
          <>
            <h1 className="mb-1 text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
              Velkommen til Slate
            </h1>
            <p className="mb-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Steg 1 av 3 — Eksisterende data?
            </p>
            <ConfigImporter onImported={handleConfigImported} onSkip={handleSkipImport} />
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="mb-1 text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
              Velg vault-mappe
            </h1>
            <p className="mb-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Steg 2 av 3 — Obsidian-vault
            </p>
            <VaultPicker
              initialPath={vaultPath}
              onNext={handleVaultChosen}
            />
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="mb-1 text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
              Velg tema
            </h1>
            <p className="mb-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Steg 3 av 3 — Utseende
            </p>
            <ThemePicker selected={theme} onSelect={setTheme} />

            {error && (
              <div
                className="mt-4 rounded-lg border px-4 py-3 text-sm"
                style={{
                  background: 'rgba(220,38,38,0.08)',
                  borderColor: 'rgba(220,38,38,0.3)',
                  color: '#ef4444',
                }}
              >
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(2)} className="btn-secondary">
                Tilbake
              </button>
              <button onClick={handleFinish} disabled={saving} className="btn-primary">
                {saving ? 'Starter…' : 'Kom i gang'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
