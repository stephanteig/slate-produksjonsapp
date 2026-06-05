import React, { useEffect, useState } from 'react'

interface Props {
  shotlistId: string
  imagePaths: string[]
  onAdd: (relativePath: string) => void
  onRemove: (relativePath: string) => void
}

function MoodboardImage({ path, onRemove }: { path: string; onRemove: () => void }) {
  const [src, setSrc] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    let cancelled = false
    window.electronAPI.readVaultImage(path).then((res) => {
      if (!cancelled && res.success) setSrc(res.data!)
    })
    return () => { cancelled = true }
  }, [path])

  if (!src) {
    return (
      <div
        className="aspect-square rounded-lg animate-pulse"
        style={{ background: 'var(--color-border)' }}
      />
    )
  }

  return (
    <>
      <div className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => setFullscreen(true)}>
        <img src={src} alt="" className="w-full h-full object-cover" />
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-5 h-5 rounded-full text-xs"
          style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
        >
          ✕
        </button>
      </div>
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setFullscreen(false)}
        >
          <img src={src} alt="" className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain" />
        </div>
      )}
    </>
  )
}

export function MoodboardPanel({ shotlistId, imagePaths, onAdd, onRemove }: Props) {
  async function handleAdd() {
    const filePath = await window.electronAPI.pickFile({
      filters: [{ name: 'Bilder', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
    })
    if (!filePath) return

    const result = await window.electronAPI.uploadShotImage({
      shotlistId,
      imageType: 'moodboard',
      sourcePath: filePath,
    })

    if (result.oversized) {
      const proceed = window.confirm('Filen er stor og kan påvirke ytelsen. Fortsett?')
      if (!proceed) return
      const retry = await window.electronAPI.uploadShotImage({
        shotlistId,
        imageType: 'moodboard',
        sourcePath: filePath,
      })
      if (retry.success) onAdd(retry.data!)
    } else if (result.success) {
      onAdd(result.data!)
    }
  }

  return (
    <div className="border-t p-4" style={{ borderColor: 'var(--color-border)' }}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
          Moodboard
        </span>
        <button onClick={handleAdd} className="btn-secondary text-xs py-0.5 px-2">
          + Legg til bilde
        </button>
      </div>
      {imagePaths.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Ingen bilder ennå. Legg til referansebilder for moodboard.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {imagePaths.map((p) => (
            <MoodboardImage key={p} path={p} onRemove={() => onRemove(p)} />
          ))}
        </div>
      )}
    </div>
  )
}
