import React, { useEffect, useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ShotRow as ShotRowType } from '../../../shared/types/shotlist'
import { SHOT_SIZES, CAMERA_MOVEMENTS } from '../../../shared/constants'

interface Props {
  row: ShotRowType
  shotlistId: string
  shotNumber?: number
  onChange: (updated: ShotRowType) => void
  onDelete: () => void
  onAddBelow: (type: ShotRowType['type']) => void
}

function AutoTextarea({
  value,
  onChange,
  placeholder,
  onEnter,
  className,
  style,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  onEnter?: () => void
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      rows={1}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          onEnter?.()
        }
      }}
      placeholder={placeholder}
      className={className}
      style={{ resize: 'none', overflow: 'hidden', minHeight: '1.5rem', ...style }}
    />
  )
}

function StoryboardImage({
  imagePath,
  shotlistId,
  rowId,
  onUpload,
}: {
  imagePath?: string
  shotlistId: string
  rowId: string
  onUpload: (relativePath: string) => void
}) {
  const [src, setSrc] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (!imagePath) { setSrc(null); return }
    let cancelled = false
    window.electronAPI.readVaultImage(imagePath).then((res) => {
      if (!cancelled && res.success) setSrc(res.data!)
      else if (!cancelled) setSrc(null)
    })
    return () => { cancelled = true }
  }, [imagePath])

  async function handleUpload() {
    const filePath = await window.electronAPI.pickFile({
      filters: [{ name: 'Bilder', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
    })
    if (!filePath) return
    const result = await window.electronAPI.uploadShotImage({
      shotlistId,
      shotId: rowId,
      imageType: 'storyboard',
      sourcePath: filePath,
    })
    if (result.success) onUpload(result.data!)
  }

  if (src) {
    return (
      <>
        <div className="group relative w-16 h-12 rounded overflow-hidden cursor-pointer flex-shrink-0" onClick={() => setFullscreen(true)}>
          <img src={src} alt="Storyboard" className="w-full h-full object-cover" />
          <button
            onClick={(e) => { e.stopPropagation(); handleUpload() }}
            className="absolute inset-0 hidden group-hover:flex items-center justify-center text-[10px] font-medium"
            style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
          >
            Bytt
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

  return (
    <button
      onClick={handleUpload}
      className="w-16 h-12 rounded border border-dashed flex-shrink-0 flex items-center justify-center text-[10px]"
      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
    >
      + Bilde
    </button>
  )
}

export function ShotRow({ row, shotlistId, shotNumber, onChange, onDelete, onAddBelow }: Props) {
  const [showDetails, setShowDetails] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  if (row.type === 'note') {
    return (
      <div ref={setNodeRef} style={style} className="group flex items-start gap-2 py-1">
        <span {...attributes} {...listeners} className="cursor-grab mt-0.5 opacity-0 group-hover:opacity-40 text-xs select-none">⠿</span>
        <span className="mt-0.5 text-[11px]" style={{ color: '#e5c07b' }}>📝</span>
        <AutoTextarea
          value={row.text}
          onChange={(v) => onChange({ ...row, text: v })}
          placeholder="Notat…"
          onEnter={() => onAddBelow('note')}
          className="flex-1 bg-transparent text-xs outline-none"
          style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}
        />
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-60 text-xs" style={{ color: 'var(--color-text-muted)' }}>✕</button>
      </div>
    )
  }

  if (row.type === 'quote') {
    return (
      <div ref={setNodeRef} style={style} className="group flex items-start gap-2 py-1">
        <span {...attributes} {...listeners} className="cursor-grab mt-0.5 opacity-0 group-hover:opacity-40 text-xs select-none">⠿</span>
        <span className="mt-0.5 text-[11px]" style={{ color: '#c678dd' }}>❝</span>
        <AutoTextarea
          value={row.text}
          onChange={(v) => onChange({ ...row, text: v })}
          placeholder="Sitat…"
          onEnter={() => onAddBelow('quote')}
          className="flex-1 bg-transparent text-xs outline-none"
          style={{ color: '#c678dd' }}
        />
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-60 text-xs" style={{ color: 'var(--color-text-muted)' }}>✕</button>
      </div>
    )
  }

  // type === 'shot'
  return (
    <div ref={setNodeRef} style={style} className="group space-y-1 py-1">
      <div className="flex items-start gap-2">
        <span {...attributes} {...listeners} className="cursor-grab mt-0.5 opacity-0 group-hover:opacity-40 text-xs select-none flex-shrink-0">⠿</span>
        <span className="mt-0.5 text-xs font-mono w-5 text-right flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
          {shotNumber ?? ''}
        </span>
        <input
          type="checkbox"
          checked={row.checked}
          onChange={(e) => onChange({ ...row, checked: e.target.checked })}
          className="mt-1 flex-shrink-0"
          style={{ accentColor: 'var(--color-accent)' }}
        />
        <StoryboardImage
          imagePath={row.imagePath}
          shotlistId={shotlistId}
          rowId={row.id}
          onUpload={(p) => onChange({ ...row, imagePath: p })}
        />
        <AutoTextarea
          value={row.text}
          onChange={(v) => onChange({ ...row, text: v })}
          placeholder="Beskriv shottet…"
          onEnter={() => onAddBelow('shot')}
          className="flex-1 bg-transparent text-xs outline-none"
          style={{ color: 'var(--color-text)' }}
        />
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setShowDetails((v) => !v)}
            className="text-[10px] opacity-0 group-hover:opacity-60"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {showDetails ? '▲' : '▼'}
          </button>
          <button onClick={onDelete} className="opacity-0 group-hover:opacity-60 text-xs" style={{ color: 'var(--color-text-muted)' }}>✕</button>
        </div>
      </div>

      {showDetails && (
        <div className="ml-14 grid grid-cols-2 gap-1.5">
          <div>
            <label className="block text-[10px] mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Shot size</label>
            <select
              value={row.shotSize ?? ''}
              onChange={(e) => onChange({ ...row, shotSize: e.target.value || undefined })}
              className="input-base w-full text-xs py-0.5"
            >
              <option value="">—</option>
              {SHOT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Linse</label>
            <input
              value={row.lens ?? ''}
              onChange={(e) => onChange({ ...row, lens: e.target.value || undefined })}
              placeholder="24mm, 50mm…"
              className="input-base w-full text-xs py-0.5"
            />
          </div>
          <div>
            <label className="block text-[10px] mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Bevegelse</label>
            <select
              value={row.movement ?? ''}
              onChange={(e) => onChange({ ...row, movement: e.target.value || undefined })}
              className="input-base w-full text-xs py-0.5"
            >
              <option value="">—</option>
              {CAMERA_MOVEMENTS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Tilleggsnotat</label>
            <input
              value={row.extraNotes ?? ''}
              onChange={(e) => onChange({ ...row, extraNotes: e.target.value || undefined })}
              placeholder="Ekstra detaljer…"
              className="input-base w-full text-xs py-0.5"
            />
          </div>
        </div>
      )}
    </div>
  )
}
