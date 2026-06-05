import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import path from 'path'
import fs from 'fs'
import os from 'os'

function seedConfig(): { userDataDir: string; vaultDir: string } {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-e2e-eq-ud-'))
  const vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-e2e-eq-vault-'))

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

  return { userDataDir, vaultDir }
}

test('utstyrslisten er tom uten utstyr', async () => {
  const { userDataDir, vaultDir } = seedConfig()
  const app = await electron.launch({
    args: ['--user-data-dir=' + userDataDir, path.join(__dirname, '../../out/main/index.js')],
    env: { ...process.env, SLATE_TEST: '1' },
  })
  try {
    const page = await app.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('text=Prosjekter', { timeout: 10_000 })

    // Navigate to equipment
    await page.getByText('Utstyr').click()
    await expect(page.getByText('Ingen utstyr funnet.')).toBeVisible({ timeout: 5_000 })
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

test('opprett utstyr validerer påkrevde felt', async () => {
  const { userDataDir, vaultDir } = seedConfig()
  const app = await electron.launch({
    args: ['--user-data-dir=' + userDataDir, path.join(__dirname, '../../out/main/index.js')],
    env: { ...process.env, SLATE_TEST: '1' },
  })
  try {
    const page = await app.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('text=Prosjekter', { timeout: 10_000 })

    await page.getByText('Utstyr').click()
    await page.waitForSelector('text=Ingen utstyr funnet.', { timeout: 5_000 })

    await page.getByRole('button', { name: '+ Nytt' }).click()
    await expect(page.getByText('Nytt utstyr')).toBeVisible()

    // Try to create without required fields
    await page.getByRole('button', { name: 'Opprett' }).click()
    await expect(page.getByText('Navn er påkrevd.')).toBeVisible()
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

test('opprett og slett utstyr', async () => {
  const { userDataDir, vaultDir } = seedConfig()
  const app = await electron.launch({
    args: ['--user-data-dir=' + userDataDir, path.join(__dirname, '../../out/main/index.js')],
    env: { ...process.env, SLATE_TEST: '1' },
  })
  try {
    const page = await app.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('text=Prosjekter', { timeout: 10_000 })

    await page.getByText('Utstyr').click()
    await page.waitForSelector('text=Ingen utstyr funnet.', { timeout: 5_000 })
    await page.getByRole('button', { name: '+ Nytt' }).click()

    await page.getByPlaceholder('Navn').fill('Sony FX3')
    await page.getByPlaceholder('Kategori').fill('Kamera')
    await page.getByRole('button', { name: 'Opprett' }).click()

    // Wait for card to appear in sidebar
    await expect(page.getByRole('button', { name: /Sony FX3/ })).toBeVisible()

    // Select it (click the card)
    await page.getByRole('button', { name: /Sony FX3/ }).click()
    await page.getByRole('button', { name: 'Slett' }).click()
    await expect(page.getByText('Slett «Sony FX3» permanent?')).toBeVisible()
    await page.getByRole('button', { name: 'Slett' }).last().click()

    await expect(page.getByRole('button', { name: /Sony FX3/ })).not.toBeVisible({ timeout: 5_000 })
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})
