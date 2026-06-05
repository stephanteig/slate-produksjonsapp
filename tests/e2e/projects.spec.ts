import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import path from 'path'
import fs from 'fs'
import os from 'os'

/**
 * Sets up a pre-configured app state so tests skip onboarding.
 * Writes a slate-config.json and initializes the vault structure.
 */
function seedConfig(): { userDataDir: string; vaultDir: string } {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-e2e-proj-ud-'))
  const vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-e2e-proj-vault-'))

  // Create vault structure
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'projects'), { recursive: true })
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'equipment', 'loans'), { recursive: true })
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'kits'), { recursive: true })
  fs.mkdirSync(path.join(vaultDir, 'Slate', 'calendar'), { recursive: true })

  const config = {
    vaultPath: vaultDir,
    theme: 'nordic-slate',
    owners: [{ id: 'owner-1', name: 'Test Eier' }],
  }
  fs.writeFileSync(
    path.join(userDataDir, 'slate-config.json'),
    JSON.stringify(config, null, 2)
  )

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

test('app laster prosjekt-visning når config er satt', async () => {
  const { app, page, userDataDir, vaultDir } = await launchSeeded()
  try {
    // Should NOT see onboarding
    await expect(page.getByText('Velkommen til Slate')).not.toBeVisible({ timeout: 5_000 })
    // Should see main layout (sidebar nav button)
    await expect(page.getByRole('button', { name: 'Prosjekter' })).toBeVisible({ timeout: 10_000 })
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

test('opprett prosjekt — tittel er påkrevd', async () => {
  const { app, page, userDataDir, vaultDir } = await launchSeeded()
  try {
    await page.waitForSelector('text=Prosjekter', { timeout: 10_000 })
    await page.getByRole('button', { name: '+ Nytt' }).first().click()
    await page.waitForSelector('text=Nytt prosjekt')

    // Try creating with empty title
    await page.getByRole('button', { name: 'Opprett' }).click()
    await expect(page.getByText('Prosjektnavn kan ikke være tomt.')).toBeVisible()
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

test('opprett og arkiver prosjekt', async () => {
  const { app, page, userDataDir, vaultDir } = await launchSeeded()
  try {
    await page.waitForSelector('text=Prosjekter', { timeout: 10_000 })

    // Create project
    await page.getByRole('button', { name: '+ Nytt' }).first().click()
    await page.waitForSelector('text=Nytt prosjekt')
    await page.getByPlaceholder('Prosjektnavn').fill('E2E Testprosjekt')
    await page.getByRole('button', { name: 'Opprett' }).click()

    // Should appear in list (the card in the sidebar)
    await expect(page.getByText('E2E Testprosjekt').first()).toBeVisible()

    // Archive it (exact match avoids matching "Vis arkiverte" button)
    await page.getByRole('button', { name: 'Arkiver', exact: true }).click()
    await expect(page.getByText('Er du sikker')).toBeVisible()
    await page.getByRole('button', { name: 'Arkiver', exact: true }).last().click()

    // Archived projects are hidden by default (card in sidebar)
    await expect(page.getByRole('button', { name: /E2E Testprosjekt/ })).not.toBeVisible()

    // Show archived brings it back
    await page.getByRole('button', { name: 'Vis arkiverte' }).click()
    await expect(page.getByRole('button', { name: /E2E Testprosjekt/ })).toBeVisible()
  } finally {
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})
