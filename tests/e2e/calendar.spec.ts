import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import path from 'path'
import fs from 'fs'
import os from 'os'

function seedConfig(withLoan = false): { userDataDir: string; vaultDir: string } {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-e2e-cal-ud-'))
  const vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-e2e-cal-vault-'))

  fs.mkdirSync(path.join(vaultDir, 'Slate', 'projects'), { recursive: true })
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'equipment', 'loans'), { recursive: true })
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'kits'), { recursive: true })
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'calendar'), { recursive: true })

  fs.writeFileSync(
    path.join(userDataDir, 'slate-config.json'),
    JSON.stringify({
      vaultPath: vaultDir,
      theme: 'nordic-slate',
      owners: [{ id: 'owner-1', name: 'Test Eier' }],
    }, null, 2)
  )

  if (withLoan) {
    // Seed an overdue loan to test notification badge
    const eqContent = `---
id: eq-test
name: Test Kamera
category: Kamera
ownerId: owner-1
status: on-loan
created: 2026-01-01
---`
    fs.writeFileSync(path.join(vaultDir, 'Slate', 'equipment', 'test-kamera.md'), eqContent)

    const loanContent = `---
id: loan-overdue
equipmentId: eq-test
loanedTo: Ola Nordmann
startDate: 2026-01-01
endDate: 2026-01-05
returned: false
---`
    fs.writeFileSync(
      path.join(vaultDir, 'Slate', 'equipment', 'loans', '2026-01-01-test-kamera-loan-overdue.md'),
      loanContent
    )
  }

  return { userDataDir, vaultDir }
}

test('kalendervisning laster og viser månedsnavn', async () => {
  const { userDataDir, vaultDir } = seedConfig()
  const app = await electron.launch({
    args: ['--user-data-dir=' + userDataDir, path.join(__dirname, '../../out/main/index.js')],
    env: { ...process.env, SLATE_TEST: '1' },
  })
  try {
    const page = await app.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('text=Prosjekter', { timeout: 10_000 })

    await page.getByRole('button', { name: 'Kalender' }).click()
    await page.waitForTimeout(500)

    // Should show the month navigation header (contains a year like 2026)
    await expect(page.getByRole('button', { name: '‹' })).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('button', { name: '›' })).toBeVisible()

    // Calendar grid should show the month heading (has "capitalize" class)
    const calendarContent = await page.locator('h2.capitalize').textContent()
    expect(calendarContent).toBeTruthy()
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

test('forfalte utlån viser notifikasjons-badge', async () => {
  const { userDataDir, vaultDir } = seedConfig(true)
  const app = await electron.launch({
    args: ['--user-data-dir=' + userDataDir, path.join(__dirname, '../../out/main/index.js')],
    env: { ...process.env, SLATE_TEST: '1' },
  })
  try {
    const page = await app.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('text=Prosjekter', { timeout: 10_000 })

    // Notification bell should show badge with count
    await expect(page.locator('span').filter({ hasText: '1' }).first()).toBeVisible({ timeout: 5_000 })
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

test('månednavigering fungerer', async () => {
  const { userDataDir, vaultDir } = seedConfig()
  const app = await electron.launch({
    args: ['--user-data-dir=' + userDataDir, path.join(__dirname, '../../out/main/index.js')],
    env: { ...process.env, SLATE_TEST: '1' },
  })
  try {
    const page = await app.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('text=Prosjekter', { timeout: 10_000 })

    await page.getByRole('button', { name: 'Kalender' }).click()
    await page.waitForTimeout(500)

    // Navigate forward
    await page.getByRole('button', { name: '›' }).click()
    await page.waitForTimeout(300)
    // Navigate back
    await page.getByRole('button', { name: '‹' }).click()

    // Calendar grid should still be visible
    const calendarButtons = page.locator('button[class*="min-h"]')
    await expect(calendarButtons.first()).toBeVisible({ timeout: 3_000 })
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})
