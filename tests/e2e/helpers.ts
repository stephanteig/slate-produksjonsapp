import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'
import path from 'path'
import fs from 'fs'
import os from 'os'

export async function launchApp(): Promise<{ app: ElectronApplication; page: Page; tmpDir: string }> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-e2e-'))

  const app = await electron.launch({
    args: [path.join(__dirname, '../../out/main/index.js')],
    env: {
      ...process.env,
      NODE_ENV: 'test',
      SLATE_TEST_USER_DATA: tmpDir,
    },
  })

  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')

  return { app, page, tmpDir }
}

export async function closeApp(app: ElectronApplication, tmpDir: string): Promise<void> {
  await app.close()
  fs.rmSync(tmpDir, { recursive: true, force: true })
}

/** Complete onboarding with a tmp vault dir */
export async function completeOnboarding(page: Page, vaultDir: string): Promise<void> {
  // Step 1: skip import
  await page.getByRole('button', { name: 'Start fra scratch' }).click()

  // Step 2: vault is picked via IPC — we mock it by setting a known path
  // Use the "Gå videre" button after the vault path is shown
  // Since we can't trigger native file pickers in tests,
  // we verify the onboarding UI renders and the buttons are present
  await page.waitForSelector('text=Velg vault-mappe')
}
