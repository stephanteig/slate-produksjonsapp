import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import path from 'path'
import fs from 'fs'
import os from 'os'

let tmpDir: string

test.beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-e2e-onboarding-'))
})

test.afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

test('første oppstart viser onboarding steg 1', async () => {
  const app = await electron.launch({
    args: ['--user-data-dir=' + tmpDir, path.join(__dirname, '../../out/main/index.js')],
    env: { ...process.env, SLATE_TEST: '1' },
  })

  try {
    const page = await app.firstWindow()
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Velkommen til Slate')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Steg 1 av 3')).toBeVisible()
    await expect(page.getByRole('button', { name: /importer/i })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start fra scratch' })).toBeVisible()
  } finally {
    await app.close()
  }
})

test('hopp over import — viser steg 2', async () => {
  const app = await electron.launch({
    args: ['--user-data-dir=' + tmpDir, path.join(__dirname, '../../out/main/index.js')],
    env: { ...process.env, SLATE_TEST: '1' },
  })

  try {
    const page = await app.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('text=Velkommen til Slate', { timeout: 10_000 })

    await page.getByRole('button', { name: 'Start fra scratch' }).click()

    await expect(page.getByText('Velg vault-mappe')).toBeVisible()
    await expect(page.getByText('Steg 2 av 3')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Gå videre' })).toBeVisible()
    await expect(page.getByRole('button', { name: /importer eksisterende/i })).toBeVisible()
  } finally {
    await app.close()
  }
})

test('gå videre uten vault-sti viser feilmelding', async () => {
  const app = await electron.launch({
    args: ['--user-data-dir=' + tmpDir, path.join(__dirname, '../../out/main/index.js')],
    env: { ...process.env, SLATE_TEST: '1' },
  })

  try {
    const page = await app.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('text=Velkommen til Slate', { timeout: 10_000 })

    await page.getByRole('button', { name: 'Start fra scratch' }).click()
    await page.waitForSelector('text=Velg vault-mappe')

    // "Gå videre" should be disabled when no path is set
    const nextBtn = page.getByRole('button', { name: 'Gå videre' })
    await expect(nextBtn).toBeDisabled()
  } finally {
    await app.close()
  }
})
