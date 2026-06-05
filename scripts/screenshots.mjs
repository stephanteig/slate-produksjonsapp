/**
 * Slate — Screenshot capture script
 *
 * Launches the built Electron app with seeded vault data,
 * navigates to every feature view, and saves screenshots to
 * assets/screenshots/<view>.png at 1280×800.
 *
 * Usage:  node scripts/screenshots.mjs
 * Requires:  npm run build  (out/main/index.js must exist)
 */

import { _electron as electron } from 'playwright'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SCREENSHOTS_DIR = path.join(ROOT, 'assets', 'screenshots')
const MAIN_JS = path.join(ROOT, 'out', 'main', 'index.js')

// ── Seeded vault data ─────────────────────────────────────────────────────────

function seedVault(vaultDir) {
  // Slate directory structure
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'projects', 'eksamen-2026'), { recursive: true })
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'projects', 'brand-film-2026'), { recursive: true })
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'equipment', 'loans'), { recursive: true })
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'kits'), { recursive: true })
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'calendar'), { recursive: true })
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'shotlists'), { recursive: true })

  // Project 1 — in-progress (quote dates to prevent YAML Date object parsing)
  fs.writeFileSync(
    path.join(vaultDir, 'Slate', 'projects', 'eksamen-2026', 'project.md'),
    `---
id: proj-1
title: Eksamen 2026
status: in-progress
dropbox: https://www.dropbox.com/sh/examfolder
created: "2026-05-01"
updated: "2026-06-05"
tags: [slate, project]
---
`
  )
  fs.writeFileSync(
    path.join(vaultDir, 'Slate', 'projects', 'eksamen-2026', 'tasks.md'),
    `---
projectId: proj-1
---

- [ ] Råklipp levert
  - [x] Scene 1
  - [ ] Scene 2
- [x] Manus ferdig
- [ ] Fargegrading
- [ ] Eksportert til Dropbox
`
  )

  // Project 2 — planning
  fs.writeFileSync(
    path.join(vaultDir, 'Slate', 'projects', 'brand-film-2026', 'project.md'),
    `---
id: proj-2
title: Brand Film 2026
status: planning
created: "2026-06-01"
updated: "2026-06-05"
tags: [slate, project]
---
`
  )
  fs.writeFileSync(
    path.join(vaultDir, 'Slate', 'projects', 'brand-film-2026', 'tasks.md'),
    `---
projectId: proj-2
---

- [ ] Manuskript
- [ ] Location scouting
- [ ] Booket crew
`
  )

  // Equipment — quote dates to prevent YAML Date parsing
  fs.writeFileSync(
    path.join(vaultDir, 'Slate', 'equipment', 'sony-fx3.md'),
    `---
id: eq-1
name: Sony FX3
category: Kamera
ownerId: owner-1
serialNumber: SN12345
purchasePrice: 45000
status: available
created: "2026-05-01"
---

Fullt kamera-oppsett med ekstra batterier.
`
  )
  fs.writeFileSync(
    path.join(vaultDir, 'Slate', 'equipment', 'godox-sl200ii.md'),
    `---
id: eq-2
name: Godox SL200II
category: Lys
ownerId: owner-1
serialNumber: GDX-9981
purchasePrice: 3500
status: available
created: "2026-05-15"
---

Daylight LED panel.
`
  )
  fs.writeFileSync(
    path.join(vaultDir, 'Slate', 'equipment', 'rode-ntg5.md'),
    `---
id: eq-3
name: Røde NTG5
category: Lyd
ownerId: owner-2
serialNumber: RDE-5567
purchasePrice: 5200
status: on-loan
created: "2026-04-10"
---

Shotgun-mikrofon.
`
  )

  // Loan — quote dates to prevent YAML from converting them to Date objects
  fs.writeFileSync(
    path.join(vaultDir, 'Slate', 'equipment', 'loans', '2026-06-10-rode-ntg5.md'),
    `---
id: loan-1
equipmentId: eq-3
loanedTo: Kari Nordmann
startDate: "2026-06-10"
endDate: "2026-06-25"
returned: false
projectId: proj-2
---
`
  )

  // Kit
  fs.writeFileSync(
    path.join(vaultDir, 'Slate', 'kits', 'interview-kit.md'),
    `---
id: kit-1
name: Interview Kit
shotType: Intervju
equipmentIds:
  - eq-1
  - eq-2
  - eq-3
---

Standard intervjuoppsett. Alltid med stativ og diffduk.
`
  )

  // Shoot day — dates must be quoted strings to prevent gray-matter/YAML from parsing them as Date objects
  fs.writeFileSync(
    path.join(vaultDir, 'Slate', 'calendar', '2026-06-20-shoot-1.md'),
    `---
id: shoot-1
date: "2026-06-20"
title: Shoot — Produkt X
projectId: proj-1
location: Oslo Studio, Grünerløkka
crew: Stephan, Kari, Ola
equipmentIds:
  - eq-1
  - eq-2
---

Husk å booke parkering.
`
  )

  // Shotlist — quote dates
  fs.writeFileSync(
    path.join(vaultDir, 'Slate', 'shotlists', 'interview-produkt-x-sl-1.md'),
    `---
id: sl-1
title: Interview — Produkt X
projectId: proj-1
shootDayId: shoot-1
moodboardImages: []
createdAt: "2026-06-01"
updatedAt: "2026-06-05"
sections:
  - id: sec-1
    name: Åpning
    color: '#4f8ef7'
    collapsed: false
    rows:
      - id: row-1
        type: shot
        text: Wide establishing shot av bygningen
        checked: false
        shotSize: Vidvinkel
        lens: 24mm
        movement: Dolly inn
        extraNotes: Skyt ved gyllen time
      - id: row-2
        type: shot
        text: Medium shot av intervjuobjekt
        checked: true
        shotSize: Halvnært
        lens: 50mm
        movement: Statisk
      - id: row-3
        type: note
        text: Husk ekstra batteri til mikrofon
        checked: false
  - id: sec-2
    name: Hoveddel
    color: '#e87f4e'
    collapsed: false
    rows:
      - id: row-4
        type: shot
        text: Nært på produkt
        checked: false
        shotSize: Nært
        lens: 85mm
        movement: Statisk
      - id: row-5
        type: shot
        text: Over-shoulder mot skjerm
        checked: false
        shotSize: Halvnært
        lens: 35mm
        movement: Panorering
      - id: row-6
        type: quote
        text: "Det beste produktet jeg har brukt"
        checked: false
---
`
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function takeScreenshots() {
  // Ensure output directory exists
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })

  // Create temp dirs
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-ss-ud-'))
  const vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-ss-vault-'))

  console.log('📁 userDataDir:', userDataDir)
  console.log('📁 vaultDir:', vaultDir)

  try {
    // Seed vault
    seedVault(vaultDir)

    // Write config
    const config = {
      vaultPath: vaultDir,
      theme: 'nordic-slate',
      owners: [
        { id: 'owner-1', name: 'Stephan Teig' },
        { id: 'owner-2', name: 'Kari Nordmann' },
      ],
    }
    fs.writeFileSync(path.join(userDataDir, 'slate-config.json'), JSON.stringify(config, null, 2))

    console.log('🚀 Launching Electron app...')
    const app = await electron.launch({
      args: ['--user-data-dir=' + userDataDir, MAIN_JS],
      env: { ...process.env, SLATE_TEST: '1' },
    })

    const page = await app.firstWindow()
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.waitForLoadState('domcontentloaded')

    // Wait for the app to initialize (skip onboarding, load home)
    await page.waitForSelector('button:has-text("Hjem")', { timeout: 15000 })
    await page.waitForTimeout(2000)

    const results = []

    async function screenshot(name, label) {
      const file = path.join(SCREENSHOTS_DIR, `${name}.png`)
      await page.screenshot({ path: file, fullPage: false })
      console.log(`✅ ${label} → ${name}.png`)
      results.push({ name, label, success: true, file })
    }

    async function clickNav(label) {
      // Wait for nav to be present (it may reappear after page reload)
      await page.waitForSelector('nav', { timeout: 15000 })
      // Find the sidebar nav button — look for button containing exactly the label text
      const btn = page.locator('nav').getByRole('button', { name: label })
      await btn.click({ timeout: 10000 })
      await page.waitForTimeout(1500)
    }

    // ── Home ──
    await clickNav('Hjem')
    await screenshot('home', 'Dashboard / Hjem')

    // ── Projects ──
    await clickNav('Prosjekter')
    await page.waitForTimeout(1500)
    await screenshot('projects', 'Prosjekter (liste)')

    // Click into a project for a project-detail screenshot
    try {
      await page.waitForTimeout(500)
      const projectCards = page.locator('button').filter({ hasText: 'Eksamen 2026' })
      const count = await projectCards.count()
      console.log(`Found ${count} project card button(s)`)

      if (count > 0) {
        await projectCards.first().click()
        await page.waitForTimeout(2000)
        const navStillVisible = await page.locator('nav').isVisible().catch(() => false)
        console.log('Nav still visible after project click:', navStillVisible)

        if (navStillVisible) {
          await screenshot('project-detail', 'Prosjektdetalj')
        } else {
          console.log('⚠️  Nav disappeared — recovering')
          await page.reload()
          await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
          await page.waitForSelector('nav', { timeout: 10000 })
        }
      }
    } catch (err) {
      console.log('⚠️  Project detail failed:', err.message)
      // Try to recover
      try {
        await page.reload()
        await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
        await page.waitForSelector('nav', { timeout: 10000 })
      } catch {}
    }

    // ── Equipment ──
    await clickNav('Utstyr')
    await page.waitForTimeout(1500)
    await screenshot('equipment', 'Utstyrsregister')

    // ── Calendar ──
    await clickNav('Kalender')
    await page.waitForTimeout(1500)
    await screenshot('calendar', 'Kalender')

    // ── Kits ──
    await clickNav('Kits')
    await page.waitForTimeout(1500)
    await screenshot('kits', 'Utstyrskits')

    // ── Shotlists ──
    await clickNav('Shotlister')
    await page.waitForTimeout(1500)
    await screenshot('shotlists', 'Shotlister (liste)')

    // Click into a shotlist for editor screenshot
    try {
      const shotlistBtn = page.locator('button').filter({ hasText: 'Interview — Produkt X' }).first()
      if (await shotlistBtn.isVisible({ timeout: 3000 })) {
        await shotlistBtn.click()
        await page.waitForTimeout(2000)
        const navVisible = await page.locator('nav').isVisible().catch(() => false)
        console.log('Nav visible after shotlist click:', navVisible)
        if (navVisible) {
          await screenshot('shotlist-editor', 'Shotlist editor')
        } else {
          console.log('⚠️  Nav disappeared after shotlist click — recovering')
          await page.reload()
          await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
          await page.waitForSelector('nav', { timeout: 10000 })
        }
      }
    } catch (err) {
      console.log('⚠️  Could not click into shotlist editor:', err.message)
      try {
        await page.reload()
        await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
        await page.waitForSelector('nav', { timeout: 10000 })
      } catch {}
    }

    // ── Settings ──
    await clickNav('Innstillinger')
    await page.waitForTimeout(1500)
    await screenshot('settings', 'Innstillinger')

    await app.close()

    console.log('\n📸 Screenshots complete:')
    results.forEach((r) => console.log(`  ${r.success ? '✅' : '❌'} ${r.name}.png — ${r.label}`))

    return results
  } finally {
    // Cleanup temp dirs
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true })
      fs.rmSync(vaultDir, { recursive: true, force: true })
    } catch {
      // ignore
    }
  }
}

takeScreenshots().catch((err) => {
  console.error('❌ Screenshot script failed:', err)
  process.exit(1)
})
