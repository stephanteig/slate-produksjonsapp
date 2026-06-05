import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import path from 'path'
import fs from 'fs'
import os from 'os'

function seedConfig(): { userDataDir: string; vaultDir: string } {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-e2e-sl-ud-'))
  const vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-e2e-sl-vault-'))

  fs.mkdirSync(path.join(vaultDir, 'Slate', 'projects'), { recursive: true })
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'equipment', 'loans'), { recursive: true })
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'kits'), { recursive: true })
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'calendar'), { recursive: true })
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'shotlists'), { recursive: true })

  const config = {
    vaultPath: vaultDir,
    theme: 'nordic-slate',
    owners: [],
  }
  fs.writeFileSync(path.join(userDataDir, 'slate-config.json'), JSON.stringify(config, null, 2))
  return { userDataDir, vaultDir }
}

async function launchSeeded() {
  const { userDataDir, vaultDir } = seedConfig()
  const app = await electron.launch({
    args: ['--user-data-dir=' + userDataDir, path.join(__dirname, '../../out/main/index.js')],
    env: { ...process.env, SLATE_TEST: '1' },
  })
  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  return { app, page, userDataDir, vaultDir }
}

test('navigér til Shotlister viser tom tilstand', async () => {
  const { app, page, userDataDir, vaultDir } = await launchSeeded()
  try {
    await page.waitForSelector('text=Prosjekter', { timeout: 10_000 })
    await page.getByRole('button', { name: 'Shotlister' }).click()
    await expect(page.getByText('Velg en shotlist eller opprett en ny.')).toBeVisible({ timeout: 5_000 })
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

test('opprett ny shotlist og skriv tittel', async () => {
  const { app, page, userDataDir, vaultDir } = await launchSeeded()
  try {
    await page.waitForSelector('text=Prosjekter', { timeout: 10_000 })
    await page.getByRole('button', { name: 'Shotlister' }).click()

    // Create new shotlist
    await page.getByRole('button', { name: '+ Ny' }).click()

    // Editor should appear with a title input
    const titleInput = page.getByPlaceholder('Tittel på shotlist')
    await expect(titleInput).toBeVisible({ timeout: 5_000 })

    // Type title
    await titleInput.fill('Intervju Prosjekt X')
    // Wait for auto-save debounce
    await page.waitForTimeout(700)

    // Title should appear in the left list
    await expect(page.getByText('Intervju Prosjekt X').first()).toBeVisible()
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

test('legg til seksjon og shot-rad med nummerering', async () => {
  const { app, page, userDataDir, vaultDir } = await launchSeeded()
  try {
    await page.waitForSelector('text=Prosjekter', { timeout: 10_000 })
    await page.getByRole('button', { name: 'Shotlister' }).click()
    await page.getByRole('button', { name: '+ Ny' }).click()

    const titleInput = page.getByPlaceholder('Tittel på shotlist')
    await expect(titleInput).toBeVisible({ timeout: 5_000 })
    await titleInput.fill('Test Shotlist')

    // Add a section
    await page.getByRole('button', { name: '+ Ny scene' }).click()
    await expect(page.getByPlaceholder('Navnløs scene')).toBeVisible({ timeout: 3_000 })

    // Add a shot row
    await page.getByRole('button', { name: '+ Shot' }).click()

    // Shot number 1 should appear
    await expect(page.locator('text=1').first()).toBeVisible({ timeout: 3_000 })
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

test('mal-modal åpner og inneholder 9 maler', async () => {
  const { app, page, userDataDir, vaultDir } = await launchSeeded()
  try {
    await page.waitForSelector('text=Prosjekter', { timeout: 10_000 })
    await page.getByRole('button', { name: 'Shotlister' }).click()
    await page.getByRole('button', { name: '+ Ny' }).click()

    const titleInput = page.getByPlaceholder('Tittel på shotlist')
    await expect(titleInput).toBeVisible({ timeout: 5_000 })

    // Open templates modal
    await page.getByRole('button', { name: 'Maler' }).click()
    await expect(page.getByText('Velg mal')).toBeVisible({ timeout: 3_000 })

    // All 9 templates should appear
    await expect(page.getByText('Boligfoto')).toBeVisible()
    await expect(page.getByText('Intervju')).toBeVisible()
    await expect(page.getByText('Social Media')).toBeVisible()
    await expect(page.getByText('Event')).toBeVisible()
    await expect(page.getByText('Produktfoto')).toBeVisible()
    await expect(page.getByText('Podcast Video')).toBeVisible()
    await expect(page.getByText('Testimonial')).toBeVisible()
    await expect(page.getByText('Behind the Scenes')).toBeVisible()
    await expect(page.getByText('Brand Film')).toBeVisible()
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

test('velg Intervju-mal fyller inn seksjoner og rader', async () => {
  const { app, page, userDataDir, vaultDir } = await launchSeeded()
  try {
    await page.waitForSelector('text=Prosjekter', { timeout: 10_000 })
    await page.getByRole('button', { name: 'Shotlister' }).click()
    await page.getByRole('button', { name: '+ Ny' }).click()

    await expect(page.getByPlaceholder('Tittel på shotlist')).toBeVisible({ timeout: 5_000 })

    await page.getByRole('button', { name: 'Maler' }).click()
    await expect(page.getByText('Velg mal')).toBeVisible({ timeout: 3_000 })

    // Select Intervju template — empty list so no confirm dialog
    await page.getByText('Intervju').click()

    // Sections from the template should now be visible
    await expect(page.getByText('Oppsett')).toBeVisible({ timeout: 3_000 })
    await expect(page.getByText('B-roll')).toBeVisible()
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

test('slett shotlist viser bekreftelsesdialog og fjerner fra liste', async () => {
  const { app, page, userDataDir, vaultDir } = await launchSeeded()
  try {
    await page.waitForSelector('text=Prosjekter', { timeout: 10_000 })
    await page.getByRole('button', { name: 'Shotlister' }).click()
    await page.getByRole('button', { name: '+ Ny' }).click()

    const titleInput = page.getByPlaceholder('Tittel på shotlist')
    await expect(titleInput).toBeVisible({ timeout: 5_000 })
    await titleInput.fill('Skal slettes')
    await page.waitForTimeout(700)

    // Start delete flow
    await page.getByRole('button', { name: 'Slett' }).last().click()
    await expect(page.getByRole('button', { name: 'Bekreft sletting' })).toBeVisible({ timeout: 3_000 })
    await page.getByRole('button', { name: 'Bekreft sletting' }).click()

    // Should return to empty state
    await expect(page.getByText('Velg en shotlist eller opprett en ny.')).toBeVisible({ timeout: 5_000 })
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

test('forhåndsvisning-panel viser statistikk', async () => {
  const { app, page, userDataDir, vaultDir } = await launchSeeded()
  try {
    await page.waitForSelector('text=Prosjekter', { timeout: 10_000 })
    await page.getByRole('button', { name: 'Shotlister' }).click()
    await page.getByRole('button', { name: '+ Ny' }).click()

    await expect(page.getByPlaceholder('Tittel på shotlist')).toBeVisible({ timeout: 5_000 })

    // Load Intervju template to get some content
    await page.getByRole('button', { name: 'Maler' }).click()
    await page.getByText('Intervju').click()

    // Open preview
    await page.getByRole('button', { name: 'Forhåndsvisning' }).click()
    await expect(page.getByText('Shots fullført')).toBeVisible({ timeout: 3_000 })
    await expect(page.getByText('Est. tid')).toBeVisible()
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})
