import React from 'react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { VaultSettings } from './VaultSettings'
import { DataPortability } from './DataPortability'
import { OwnerManager } from '../equipment/OwnerManager'

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
          <DataPortability />
        </section>
      </div>
    </div>
  )
}
