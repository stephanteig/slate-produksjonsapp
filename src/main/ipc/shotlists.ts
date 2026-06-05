import { ipcMain, BrowserWindow, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { IPC_CHANNELS } from '../../shared/constants'
import {
  listShotlists,
  saveShotlist,
  deleteShotlist,
  shotlistImageDir,
  getVaultPath,
} from '../services/vaultService'
import type { Shotlist, ShotSection, ShotRow } from '../../shared/types/shotlist'

const SUPPORTED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp']
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export function registerShotlistHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SHOTLISTS_LIST, () => {
    try {
      return { success: true, data: listShotlists() }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SHOTLISTS_SAVE, (_, sl: Shotlist) => {
    try {
      saveShotlist(sl)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SHOTLISTS_DELETE, (_, id: string) => {
    try {
      deleteShotlist(id)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.SHOTLISTS_UPLOAD_IMAGE,
    (
      _,
      params: {
        shotlistId: string
        shotId?: string
        imageType: 'storyboard' | 'moodboard'
        sourcePath: string
      }
    ) => {
      try {
        const ext = path.extname(params.sourcePath).toLowerCase()
        if (!SUPPORTED_IMAGE_EXTS.includes(ext)) {
          return { success: false, error: 'Kun .jpg, .png og .webp støttes.' }
        }

        const stat = fs.statSync(params.sourcePath)
        if (stat.size > MAX_IMAGE_SIZE_BYTES) {
          return {
            success: false,
            error: 'Filen er stor og kan påvirke ytelsen.',
            oversized: true,
          }
        }

        const baseDir = shotlistImageDir(params.shotlistId)
        const subDir = path.join(baseDir, params.imageType)
        if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true })

        const filename =
          params.imageType === 'storyboard' && params.shotId
            ? `${params.shotId}${ext}`
            : `${randomUUID()}${ext}`

        const destPath = path.join(subDir, filename)
        fs.copyFileSync(params.sourcePath, destPath)

        // Return relative path from vault root
        const vaultPath = getVaultPath()
        const relativePath = path.relative(vaultPath, destPath).replace(/\\/g, '/')
        return { success: true, data: relativePath }
      } catch (err) {
        return { success: false, error: String(err) }
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.SHOTLISTS_IMPORT_SWSHOT, async (event) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      const result = await dialog.showOpenDialog(win ?? BrowserWindow.getFocusedWindow()!, {
        title: 'Importer Markr shotlist',
        filters: [
          { name: 'Markr Shotlist', extensions: ['swshot', 'json'] },
        ],
        properties: ['openFile', 'multiSelections'],
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true }
      }

      const imported: Shotlist[] = []
      const errors: string[] = []

      for (const filePath of result.filePaths) {
        try {
          const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
          const shotlist = convertSwshotToShotlist(raw)
          saveShotlist(shotlist)
          imported.push(shotlist)
        } catch (err) {
          errors.push(`${path.basename(filePath)}: ${String(err)}`)
        }
      }

      if (imported.length === 0 && errors.length > 0) {
        return { success: false, error: `Filen kunne ikke leses: ${errors.join(', ')}` }
      }

      return { success: true, data: imported, errors: errors.length > 0 ? errors : undefined }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SHOTLISTS_EXPORT_PDF, async (event, shotlistId: string) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (!win) return { success: false, error: 'Fant ikke vindu' }

      const shotlists = listShotlists()
      const sl = shotlists.find((s) => s.id === shotlistId)
      if (!sl) return { success: false, error: 'Fant ikke shotlisten' }

      const saveResult = await dialog.showSaveDialog(win, {
        title: 'Lagre shotlist som PDF',
        defaultPath: `${sl.title.replace(/[^a-zA-Z0-9æøåÆØÅ\s]/g, '')}.pdf`,
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      })
      if (saveResult.canceled || !saveResult.filePath) return { success: false, canceled: true }

      // Build HTML for PDF
      const html = buildShotlistPdfHtml(sl)

      // Load HTML into a hidden window for printing
      const pdfWin = new BrowserWindow({ show: false, webPreferences: { offscreen: true } })
      await pdfWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

      const data = await pdfWin.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
      })
      pdfWin.destroy()

      fs.writeFileSync(saveResult.filePath, data)
      return { success: true, data: saveResult.filePath }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SHOOTDAY_EXPORT_PDF, async (event, shootDayId: string) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (!win) return { success: false, error: 'Fant ikke vindu' }

      // Import needed services
      const { listShootDays, listShotlists: getShotlists, listEquipment } = await import('../services/vaultService')
      const shootDays = listShootDays()
      const day = shootDays.find((d) => d.id === shootDayId)
      if (!day) return { success: false, error: 'Fant ikke shoot-dagen' }

      const allShotlists = getShotlists()
      const linkedShotlists = allShotlists.filter((sl) => sl.shootDayId === shootDayId)
      const allEquipment = listEquipment()
      const dayEquipment = allEquipment.filter((eq) => day.equipmentIds?.includes(eq.id))

      const saveResult = await dialog.showSaveDialog(win, {
        title: 'Lagre shoot-dag som PDF',
        defaultPath: `shoot-dag-${day.date}.pdf`,
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      })
      if (saveResult.canceled || !saveResult.filePath) return { success: false, canceled: true }

      const html = buildShootDayPdfHtml(day, linkedShotlists, dayEquipment)
      const pdfWin = new BrowserWindow({ show: false, webPreferences: { offscreen: true } })
      await pdfWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

      const data = await pdfWin.webContents.printToPDF({ printBackground: true, pageSize: 'A4' })
      pdfWin.destroy()

      fs.writeFileSync(saveResult.filePath, data)
      return { success: true, data: saveResult.filePath }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}

// ── VAULT_READ_IMAGE is registered in vault.ts ─────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────────

function convertSwshotToShotlist(raw: Record<string, unknown>): Shotlist {
  if (!raw || typeof raw !== 'object') throw new Error('Ugyldig filformat')

  const meta = (raw.meta ?? {}) as Record<string, string>
  const rawSections = (raw.sections ?? []) as Record<string, unknown>[]

  const sections: ShotSection[] = rawSections.map((s) => {
    const rows = ((s.rows ?? []) as Record<string, unknown>[]).map((r) => {
      const type = (r.type as ShotRow['type']) ?? 'shot'
      return {
        id: randomUUID(),
        type,
        text: String(r.text ?? ''),
        checked: Boolean(r.checked ?? false),
      } satisfies ShotRow
    })
    return {
      id: randomUUID(),
      name: String(s.name ?? 'Scene'),
      color: String(s.color ?? '#4f8ef7'),
      collapsed: false,
      rows,
    }
  })

  const now = new Date().toISOString().split('T')[0]
  return {
    id: randomUUID(),
    title: String(meta.client ?? 'Importert shotlist'),
    moodboardImages: [],
    createdAt: now,
    updatedAt: now,
    sections,
  }
}

function buildShotlistPdfHtml(sl: Shotlist): string {
  let shotCounter = 0
  const sectionsHtml = sl.sections
    .map((section) => {
      const rowsHtml = section.rows
        .map((row) => {
          if (row.type === 'shot') {
            shotCounter++
            const details = [
              row.shotSize ? `Størrelse: ${row.shotSize}` : '',
              row.lens ? `Linse: ${row.lens}` : '',
              row.movement ? `Bevegelse: ${row.movement}` : '',
              row.extraNotes ? `Notat: ${row.extraNotes}` : '',
            ]
              .filter(Boolean)
              .join(' &nbsp;|&nbsp; ')
            return `<tr>
              <td style="width:30px;text-align:center;color:#666">${shotCounter}</td>
              <td style="width:20px;text-align:center">${row.checked ? '☑' : '☐'}</td>
              <td><strong>${esc(row.text)}</strong>${details ? `<br><small style="color:#888">${details}</small>` : ''}</td>
            </tr>`
          }
          if (row.type === 'note') {
            return `<tr><td></td><td style="color:#b8860b">📝</td><td style="color:#666;font-style:italic">${esc(row.text)}</td></tr>`
          }
          return `<tr><td></td><td style="color:#7b68ee">❝</td><td style="color:#555">«${esc(row.text)}»</td></tr>`
        })
        .join('')
      return `
        <div style="margin-bottom:20px">
          <div style="background:${section.color}20;border-left:4px solid ${section.color};padding:6px 10px;font-weight:bold;margin-bottom:8px">${esc(section.name)}</div>
          <table style="width:100%;border-collapse:collapse;font-size:13px">${rowsHtml}</table>
        </div>`
    })
    .join('')

  const totalShots = sl.sections.flatMap((s) => s.rows).filter((r) => r.type === 'shot').length
  const doneShots = sl.sections
    .flatMap((s) => s.rows)
    .filter((r) => r.type === 'shot' && r.checked).length

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>${esc(sl.title)}</title>
    <style>body{font-family:Arial,sans-serif;margin:30px;color:#1a1a1a}h1{font-size:20px}td{padding:4px 6px;vertical-align:top}</style>
  </head><body>
    <h1>${esc(sl.title)}</h1>
    <p style="color:#666;font-size:13px">Shots: ${doneShots}/${totalShots} fullført</p>
    ${sectionsHtml}
  </body></html>`
}

function buildShootDayPdfHtml(
  day: { title: string; date: string; location?: string; crew?: string; notes?: string },
  shotlists: Shotlist[],
  equipment: { name: string; category: string }[]
): string {
  const shotlistsHtml = shotlists.length
    ? shotlists
        .map((sl) => {
          let num = 0
          const rows = sl.sections
            .flatMap((s) => s.rows)
            .filter((r) => r.type === 'shot')
            .map((r) => {
              num++
              return `<li>${num}. ${esc(r.text)}${r.checked ? ' ✓' : ''}</li>`
            })
            .join('')
          return `<div style="margin-bottom:14px"><strong>${esc(sl.title)}</strong><ul style="margin:4px 0 0 16px;font-size:12px">${rows}</ul></div>`
        })
        .join('')
    : '<p style="color:#888;font-size:13px">Ingen shotlister</p>'

  const equipmentHtml = equipment.length
    ? `<ul style="font-size:13px">${equipment.map((eq) => `<li>${esc(eq.name)} (${esc(eq.category)})</li>`).join('')}</ul>`
    : '<p style="color:#888;font-size:13px">Ingen utstyr registrert</p>'

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Shoot-dag ${day.date}</title>
    <style>body{font-family:Arial,sans-serif;margin:30px;color:#1a1a1a}h1{font-size:20px}h2{font-size:15px;border-bottom:1px solid #ddd;padding-bottom:4px}td{padding:4px 8px}</style>
  </head><body>
    <h1>${esc(day.title)}</h1>
    <table><tr><td><strong>Dato:</strong></td><td>${day.date}</td></tr>
    ${day.location ? `<tr><td><strong>Lokasjon:</strong></td><td>${esc(day.location)}</td></tr>` : ''}
    ${day.crew ? `<tr><td><strong>Crew:</strong></td><td>${esc(day.crew)}</td></tr>` : ''}
    </table>
    ${day.notes ? `<p style="font-size:13px;color:#444">${esc(day.notes)}</p>` : ''}
    <h2>Shotlister</h2>${shotlistsHtml}
    <h2>Utstyr</h2>${equipmentHtml}
  </body></html>`
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
