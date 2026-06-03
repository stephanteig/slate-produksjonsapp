import React, { useState } from 'react'
import type { Owner } from '../../../shared/types/equipment'
import { generateId } from '../../utils/markdownUtils'
import { useAppStore } from '../../store/appStore'

export function OwnerManager() {
  const { state, dispatch } = useAppStore()
  const owners = state.config?.owners ?? []
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function handleAdd() {
    if (!newName.trim() || !state.config) return
    const owner: Owner = { id: generateId(), name: newName.trim() }
    const updated = { ...state.config, owners: [...owners, owner] }
    dispatch({ type: 'SET_CONFIG', config: updated })
    await window.electronAPI.saveConfig(updated)
    setNewName('')
  }

  async function handleRename(id: string) {
    if (!editName.trim() || !state.config) return
    const updated = {
      ...state.config,
      owners: owners.map((o) => (o.id === id ? { ...o, name: editName.trim() } : o)),
    }
    dispatch({ type: 'SET_CONFIG', config: updated })
    await window.electronAPI.saveConfig(updated)
    setEditingId(null)
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
        Eiere
      </h3>
      <ul className="mb-3 space-y-2">
        {owners.map((owner) => (
          <li key={owner.id} className="flex items-center gap-2">
            {editingId === owner.id ? (
              <>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename(owner.id)}
                  className="input-base flex-1 text-sm"
                />
                <button onClick={() => handleRename(owner.id)} className="btn-primary text-xs py-1 px-2">
                  Lagre
                </button>
                <button onClick={() => setEditingId(null)} className="btn-secondary text-xs py-1 px-2">
                  Avbryt
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm" style={{ color: 'var(--color-text)' }}>
                  {owner.name}
                </span>
                <button
                  onClick={() => { setEditingId(owner.id); setEditName(owner.name) }}
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Gi nytt navn
                </button>
              </>
            )}
          </li>
        ))}
        {owners.length === 0 && (
          <li className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Ingen eiere registrert ennå.
          </li>
        )}
      </ul>
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Nytt eier-navn"
          className="input-base flex-1 text-sm"
        />
        <button onClick={handleAdd} disabled={!newName.trim()} className="btn-primary text-sm">
          Legg til
        </button>
      </div>
    </div>
  )
}
