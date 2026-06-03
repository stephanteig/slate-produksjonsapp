# CLAUDE.md — Slate
> Dette er en ferdig generert spesifikasjon klar for Claude Code.
> Les hele filen før du skriver én linje kode.
> Start med `/goal` som definert nedenfor.

---

## /goal

```
Bygg Slate — et cross-platform Electron-dashboard for videoproduksjon.
Appen lagrer all data som Markdown-filer i en Obsidian-vault.
MVP inkluderer: prosjekt-todo (med arkivering), utstyrsregister, utlånskalender,
utstyrskits, shoot-kalender, onboarding med config-import + theme-valg, theme-switcher,
in-app notifikasjoner for forfalt utlån, PDF-eksport av utstyrsliste,
og full export/import av userdata (config + /Slate/-mappe) for bruk på flere maskiner.
Appen skal være beta-klar: stabil, testet og pakket som .dmg og .exe.
```

---

## Prosjekt

**Navn:** Slate
**Beskrivelse:** Cross-platform produksjonsdashboard for videoskapere — styrer prosjekter, utstyr og kalender, og lagrer alt som Markdown i Obsidian-vaulten.
**Problem den løser:** Ingen samlet plass å styre videoproduksjonsprosjekter, utstyr og shoot-dager
**Versjon:** 1.0.0 (Beta)
**Språk i UI:** Norsk — all tekst, labels, feilmeldinger og dialogs på norsk

---

## Platform

| Plattform | Prioritet | Leveranse |
|-----------|-----------|-----------|
| macOS | Primær | `.dmg` installer |
| Windows | Sekundær | `.exe` installer |

- Utviklingsmaskin: MacBook Pro, Apple Silicon (M-chip)
- Minimum macOS: 13 Ventura
- Minimum Windows: 10

---

## Tech Stack

> Ikke endre uten eksplisitt grunn.

| Lag | Valg | Begrunnelse |
|-----|------|-------------|
| Framework | Electron | Cross-platform, sterk fs-tilgang, stor community |
| Språk | TypeScript | Typesikkerhet, bedre DX |
| UI | React 18 | Komponent-basert, godt Electron-støttet |
| Styling | Tailwind CSS + CSS custom properties | Tailwind for layout, CSS vars for runtime theme-switching |
| Markdown | `gray-matter` | YAML frontmatter parsing/serialisering |
| Datoer | `date-fns` | Lett, tree-shakeable, ingen moment.js |
| Vault-watching | Node.js `fs.watch` | Oppdager endringer fra Obsidian umiddelbart |
| Notifikasjoner | Electrons `Notification` API | In-app varsler uten tredjepartsavhengigheter |
| Zip/unzip | `adm-zip` | Export/import av userdata på tvers av maskiner |
| PDF-eksport | `electron` sin `webContents.printToPDF()` | Utstyrliste-eksport |
| Build | `electron-builder` | Produserer `.dmg` og `.exe` |
| Testing | Vitest + Playwright | Vitest for unit/integration, Playwright for E2E |
| Linting | ESLint + Prettier | Konsistent kodestil |
| Package manager | npm | Standard |

---

## IPC-arkitektur

All fil- og OS-tilgang skjer i **Electron main process** via IPC. Renderer (React) har aldri direkte tilgang til `fs`, `path` eller OS-APIer.

```
React-komponent
  → window.electronAPI.saveProject(data)
  → preload.ts (contextBridge)
  → IPC-kanal "projects:save"
  → src/main/ipc/projects.ts
  → vaultService.ts
  → fs.writeFile()
```

Alle IPC-handlere er i `src/main/ipc/`. Alle eksponerte funksjoner er i `src/main/preload.ts` via `contextBridge.exposeInMainWorld`.

---

## Avhengigheter & Oppsett

Kjør disse kommandoene i rekkefølge **før du skriver kode**:

```bash
# 1. Initialiser prosjekt
npm init -y

# 2. Core dependencies
npm install electron react react-dom gray-matter date-fns adm-zip

# 3. TypeScript og typer
npm install --save-dev typescript @types/react @types/react-dom @types/node

# 4. Tailwind
npm install --save-dev tailwindcss autoprefixer postcss

# 5. Vite + electron-vite
npm install --save-dev electron-vite

# 6. Testing
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom playwright @playwright/test

# 7. Build og packaging
npm install --save-dev electron-builder

# 8. Linting
npm install --save-dev eslint prettier eslint-config-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser

# 9. Verifiser
node -v && npm -v
```

---

## Filstruktur

Opprett denne strukturen eksakt:

```
slate/
├── src/
│   ├── main/
│   │   ├── index.ts              # Electron main process entry
│   │   ├── preload.ts            # contextBridge — eksponerer IPC til renderer
│   │   ├── ipc/
│   │   │   ├── projects.ts       # IPC handlers: prosjekter
│   │   │   ├── equipment.ts      # IPC handlers: utstyr
│   │   │   ├── calendar.ts       # IPC handlers: kalender
│   │   │   ├── kits.ts           # IPC handlers: kits
│   │   │   ├── vault.ts          # IPC handlers: vault-konfigurasjon + export/import
│   │   │   └── notifications.ts  # IPC handlers: in-app notifikasjoner
│   │   └── services/
│   │       ├── vaultService.ts   # Lese/skrive til Obsidian vault
│   │       ├── markdownService.ts # Markdown + frontmatter håndtering
│   │       ├── configService.ts  # App-konfigurasjon (userData/slate-config.json)
│   │       ├── watchService.ts   # fs.watch på vault-mappen
│   │       └── notificationService.ts # Sjekker forfalt utlån, sender varsler
│   ├── renderer/
│   │   ├── index.html
│   │   ├── main.tsx              # React entry
│   │   ├── App.tsx               # Root komponent + routing
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── MainPanel.tsx
│   │   │   │   ├── TopBar.tsx
│   │   │   │   └── NotificationBell.tsx  # Badge + dropdown for varsler
│   │   │   ├── projects/
│   │   │   │   ├── ProjectList.tsx
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── ProjectDetail.tsx
│   │   │   │   ├── TaskList.tsx
│   │   │   │   └── TaskItem.tsx
│   │   │   ├── equipment/
│   │   │   │   ├── EquipmentList.tsx
│   │   │   │   ├── EquipmentCard.tsx
│   │   │   │   ├── EquipmentDetail.tsx
│   │   │   │   ├── LoanForm.tsx
│   │   │   │   ├── KitList.tsx
│   │   │   │   └── OwnerManager.tsx      # Legg til / rediger eiere
│   │   │   ├── calendar/
│   │   │   │   ├── CalendarView.tsx
│   │   │   │   ├── ShootDayForm.tsx
│   │   │   │   └── LoanOverlay.tsx
│   │   │   ├── settings/
│   │   │   │   ├── SettingsPanel.tsx
│   │   │   │   ├── ThemeSwitcher.tsx
│   │   │   │   ├── VaultSettings.tsx     # Bytt vault-mappe
│   │   │   │   └── DataPortability.tsx   # Export/import userdata (config + /Slate/)
│   │   │   └── onboarding/
│   │   │       ├── OnboardingFlow.tsx
│   │   │       ├── ConfigImporter.tsx    # Steg 1: importer slate-config.json
│   │   │       ├── VaultPicker.tsx       # Steg 2: velg vault-mappe + importer /Slate/
│   │   │       └── ThemePicker.tsx       # Steg 3: velg default theme
│   │   ├── hooks/
│   │   │   ├── useProjects.ts
│   │   │   ├── useEquipment.ts
│   │   │   ├── useCalendar.ts
│   │   │   ├── useKits.ts
│   │   │   ├── useTheme.ts
│   │   │   └── useNotifications.ts
│   │   ├── store/
│   │   │   └── appStore.ts       # Global state (React Context)
│   │   ├── styles/
│   │   │   ├── global.css        # CSS custom properties per tema
│   │   │   └── themes/
│   │   │       ├── nordic-slate.css
│   │   │       ├── soft-dusk.css
│   │   │       ├── tokyo-night.css
│   │   │       ├── paper-ink.css
│   │   │       ├── lavender-fog.css
│   │   │       └── iron-press.css
│   │   └── utils/
│   │       ├── dateUtils.ts
│   │       ├── markdownUtils.ts
│   │       └── validationUtils.ts
│   └── shared/
│       ├── types/
│       │   ├── project.ts
│       │   ├── equipment.ts
│       │   ├── calendar.ts
│       │   ├── kit.ts
│       │   └── config.ts
│       └── constants.ts
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── vaultService.test.ts
│   │   │   ├── markdownService.test.ts
│   │   │   └── configService.test.ts
│   │   └── utils/
│   │       ├── dateUtils.test.ts
│   │       └── markdownUtils.test.ts
│   ├── integration/
│   │   ├── projects.test.ts
│   │   ├── equipment.test.ts
│   │   └── calendar.test.ts
│   └── e2e/
│       ├── onboarding.spec.ts
│       ├── projects.spec.ts
│       ├── equipment.spec.ts
│       ├── calendar.spec.ts
│       └── theme.spec.ts
├── assets/
│   ├── icons/
│   │   ├── icon.icns             # macOS
│   │   ├── icon.ico              # Windows
│   │   └── icon.png              # 512x512
│   └── fonts/
│       └── (Geist self-hosted hvis nødvendig)
├── scripts/
│   ├── build.sh
│   └── release.sh
├── dist/                         # Build output — IKKE commit
├── electron.vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Datamodell — TypeScript-typer

### shared/types/project.ts
```typescript
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  subtasks?: Task[];
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  status: 'planning' | 'in-progress' | 'delivered' | 'archived';
  dropboxUrl?: string;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  tags?: string[];
}
```

> **Viktig:** Prosjekter **slettes aldri** fra filsystemet. Status `archived` er det eneste "slettet"-konseptet. En sletteknapp i UI setter status til `archived` etter bekreftelsesdialog. Arkiverte prosjekter kan vises/skjules via filter i prosjektlisten.

### shared/types/equipment.ts
```typescript
export type EquipmentStatus = 'available' | 'on-loan' | 'in-service' | 'retired';

export interface Owner {
  id: string;
  name: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  ownerId: string;        // Refererer til Owner.id
  serialNumber?: string;
  purchasePrice?: number;
  status: EquipmentStatus;
  notes?: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  equipmentId: string;
  loanedTo: string;
  startDate: string;  // ISO 8601
  endDate: string;
  returned: boolean;
  projectId?: string;
  notes?: string;
}
```

### shared/types/calendar.ts
```typescript
export interface ShootDay {
  id: string;
  date: string;           // ISO 8601
  projectId?: string;
  title: string;
  location?: string;
  equipmentIds?: string[];
  notes?: string;
}
```

### shared/types/kit.ts
```typescript
export interface Kit {
  id: string;
  name: string;
  description?: string;
  shotType: string;
  equipmentIds: string[];
  notes?: string;
}
```

### shared/types/config.ts
```typescript
export interface SlateConfig {
  vaultPath: string;
  theme: string;
  owners: Owner[];        // Liste over registrerte eiere
}
```

> `slate-config.json` lagres i Electrons `app.getPath('userData')` — **ikke** i vaulten. Dette er standard Electron-mønster og holder konfigurasjonen ute av Obsidian.

---

## Markdown-format i Obsidian

### Prosjekt: `Slate/projects/<slug>/project.md`
```markdown
---
id: uuid-her
title: Prosjektnavn
status: in-progress
dropbox: https://www.dropbox.com/sh/...
created: 2026-06-03
updated: 2026-06-03
tags: [slate, project]
---
```

### Tasks: `Slate/projects/<slug>/tasks.md`
```markdown
---
projectId: uuid-her
---

- [ ] Råklipp levert
  - [ ] Scene 1
  - [x] Scene 2
- [ ] Fargegrading
- [ ] Eksportert til Dropbox
```

### Utstyr: `Slate/equipment/<slug>.md`
```markdown
---
id: uuid-her
name: Sony FX3
category: Kamera
ownerId: owner-uuid
serialNumber: ABC123
purchasePrice: 45000
status: available
created: 2026-06-03
---

Notater om utstyret her.
```

### Utlån: `Slate/equipment/loans/<dato>-<utstyrsnavn>.md`
```markdown
---
id: uuid-her
equipmentId: uuid-utstyr
loanedTo: Navn Navnesen
startDate: 2026-06-10
endDate: 2026-06-12
returned: false
projectId: uuid-prosjekt
---

Notater om utlånet.
```

### Kit: `Slate/kits/<slug>.md`
```markdown
---
id: uuid-her
name: Interview Kit
shotType: Interview
equipmentIds:
  - uuid-kamera
  - uuid-lys
  - uuid-mikrofon
---

Anbefalt oppsett for intervjuer.
```

### Shoot-dag: `Slate/calendar/<dato>.md`
```markdown
---
id: uuid-her
date: 2026-06-15
title: Shoot — Produkt X
projectId: uuid-prosjekt
location: Oslo Studio
equipmentIds:
  - uuid-kamera
  - uuid-lys
---

Notater om shoot-dagen.
```

---

## Features — MVP (implementer i denne rekkefølgen)

### 1. Onboarding & Vault-oppsett

**Onboarding-flyt (3 steg):**

**Steg 1 — Importer eksisterende data? (valgfritt)**
- Spørsmål: «Har du Slate-data fra en annen maskin?»
- To valg: «Importer slate-config.json» eller «Start fra scratch»
- Ved import: bruker velger `slate-config.json` via native file picker
- Config leses og lagres til `app.getPath('userData')/slate-config.json`
- Vault-sti og theme fra importert config brukes som forhåndsutfylte verdier i steg 2 og 3
- Bruker kan overstyre begge verdier i de neste stegene

**Steg 2 — Vault-mappe**
- Viser current valgt sti (forhåndsutfylt fra import hvis gjort, ellers tom)
- Native file picker for å velge/endre vault-root
- Sekundær knapp: «Importer /Slate/-mappe» — bruker velger en eksisterende `/Slate/`-mappe og den kopieres inn i valgt vault
- Appen oppretter `/Slate/`-mappestruktur hvis den ikke allerede finnes
- Klikk «Gå videre» lagrer vault-stien

**Steg 3 — Theme**
- Visuell grid med forhåndsvisning av alle 6 temaer
- Forhåndsvalgt fra importert config hvis gjort, ellers `nordic-slate` som default
- Bruker kan endre fritt

- Etter onboarding: gå rett til Prosjekter-visningen
- Lagrer ferdig config til `app.getPath('userData')/slate-config.json`

**Kan endres senere i Settings:**
- Vault-mappe (bytt sti — migrer ikke data, last inn på nytt)
- Theme
- **Eksporter userdata** — zipper `slate-config.json` + `/Slate/`-mappen til én fil, lagrer til valgt lokasjon
- **Importer userdata** — velg en tidligere eksportert zip → pakker ut config + `/Slate/`-mappe, spør om vault-sti skal beholdes eller overstyres

**Edge cases:**
- Importert config har vault-sti som ikke eksisterer på denne maskinen → vis advarsel i steg 2, ikke blokker — bruker velger ny sti
- Brukeren velger en mappe uten skriverettigheter → vis forklarende feilmelding
- `/Slate/`-mappen eksisterer allerede ved vault-valg → ikke overskriv, importer eksisterende data
- Brukeren avbryter file picker i steg 1 → hopp over import, fortsett til steg 2 med tomme defaults
- Brukeren avbryter file picker i steg 2 → forblir på steg 2, ikke gå videre
- Manglende `slate-config.json` ved oppstart → gå til onboarding
- Ukjent tema-verdi i config → fall tilbake til `nordic-slate`
- Config-fil korrupt → regenerer config med defaults, vis advarsel
- Importert zip inneholder ugyldig struktur → vis feilmelding, ikke krasj

---

### 2. Prosjekt-todo

**Hva det skal gjøre:**
- Liste over prosjekter i sidebar/main-panel, filtrerbar på status
- Arkiverte prosjekter skjules som standard, kan vises via "Vis arkiverte"-toggle
- Opprett prosjekt: navn, status, valgfri Dropbox-URL
- Inne i prosjekt: hierarkisk task-liste (tasks og sub-tasks, maks 2 nivåer i v1)
- Hak av tasks og sub-tasks
- **Arkiver prosjekt** (med bekreftelsesdialog) — setter status til `archived`, sletter ikke filen
- Rediger prosjektnavn og status
- Prosjektfiler lagres umiddelbart til Markdown ved endring

**Edge cases:**
- Tomt prosjektnavn → valider, ikke lagre
- Ugyldig Dropbox-URL (ikke https://) → advar, men tillat lagring
- Arkivere et prosjekt som har aktive utlån → advar, ikke arkiver stille
- Prosjektfil manuelt slettet fra vaulten → vis "ikke funnet"-tilstand i UI, ikke krasj
- Veldig lang task-tittel → wrap tekst, ikke overflow
- Spesialtegn i prosjektnavn (æøå, emojis) → slugify til filnavn, behold visningsnavn
- Samtidig redigering eksternt og i appen → `fs.watch` fanger opp og laster inn på nytt

---

### 3. Utstyrsregister

**Hva det skal gjøre:**
- Liste over alt utstyr med søk og filtrer på kategori og status
- Opprett utstyr: navn, kategori, **eier (velg fra liste over registrerte eiere)**, serienummer (valgfritt), innkjøpspris (valgfritt), status, notater
- Eierliste administreres i Settings → Eiere (legg til / gi nytt navn)
- Rediger utstyrskort
- Slett utstyr (med bekreftelsesdialog) — blokkeres hvis utstyret er på aktivt utlån
- Statusendring direkte fra kortvisning
- **Eksporter utstyrsliste som PDF** via "Eksporter liste"-knapp

**Edge cases:**
- Slette utstyr som er på utlån → blokkér sletting, vis hvem som har det
- Slette utstyr som inngår i ett eller flere kits → advar, fjern fra kit automatisk
- Duplikat serienummer → advar, ikke blokkér
- Negativt innkjøpspris → valider til 0 minimum
- Ingen utstyr registrert → vis tom tilstand med CTA
- Ingen eiere registrert → vis CTA for å legge til eier

---

### 4. Utlånskalender

**Hva det skal gjøre:**
- Opprett utlånsperiode: velg utstyr, lånedato (fra/til), navn på låntaker, valgfritt prosjekt
- Kalendervisning (månedsoversikt) med fargemarkering av utlånte dager
- Klikk på dag for å se hva som er utlånt
- Avslutt utlån (merk som levert tilbake — setter `returned: true`)
- Utlånsstatus oppdaterer utstyrets status automatisk

**In-app notifikasjoner for forfalt utlån:**
- `notificationService.ts` kjøres ved oppstart og daglig (via `setInterval`)
- Alle utlån der `endDate` er passert og `returned: false` → genererer varsel
- Varsel vises i `NotificationBell`-komponenten øverst i appen (badge med antall)
- Klikk på varsel → åpner kalendervisning med det aktuelle utlånet uthevet
- Bruker kan markere utstyr som levert direkte fra varsel-dropdown

**Edge cases:**
- Overlappende utlånsperioder for samme utstyr → blokkér med tydelig feilmelding
- Sluttdato før startdato → valider og blokkér
- Utlån over månedsskifte → vises korrekt i begge måneder
- Utstyr satt til "in-service" mens det har aktiv utlånsperiode → advar
- Ingen fremtidige utlån → vis tom tilstand

---

### 5. Utstyrskits

**Hva det skal gjøre:**
- Opprett kit: navn, shot-type, liste over utstyr (velg fra registeret), notater
- Vis kit med utstyrsliste og tilgjengelighet per utstyrsenhet (grønt = tilgjengelig, grått = på utlån/service)
- Rediger kit
- Slett kit

**Edge cases:**
- Utstyr i kit er på utlån → marker som utilgjengelig, ikke fjern fra kit
- Utstyr slettes fra registeret → fjern automatisk fra alle kits, vis advarsel
- Tom kit → tillat lagring, vis advarsel i UI
- Duplikat kit-navn → advar, ikke blokkér

---

### 6. Shoot-kalender

**Hva det skal gjøre:**
- Legg til shoot-dag: dato, tittel, valgfri lokasjon, valgfritt prosjekt, valgfritt utstyr
- Kalendervisning viser shoot-dager og utlånsdager i samme view (ulike farger)
- Klikk på shoot-dag for detaljer
- Rediger og slett shoot-dag (med bekreftelsesdialog)

**Edge cases:**
- Samme dato som eksisterende shoot-dag → tillat (to shoots på én dag er mulig)
- Utstyr valgt på shoot-dag er allerede utlånt → advar, ikke blokkér
- Shoot-dag i fortiden → tillat, vis visuelt som "passert"
- Prosjekt tilknyttet shoot-dag slettes/arkiveres → behold shoot-dag, fjern prosjekt-referansen

---

### 7. Theme-switcher

**Hva det skal gjøre:**
- Velges første gang under onboarding
- Kan endres i Settings med live forhåndsvisning
- Tema bytter umiddelbart (ingen reload) via `data-theme`-attributt på `<html>`
- Valgt tema lagres i `slate-config.json`

**CSS custom properties per tema:**

```css
/* Nordic Slate — Mørk */
[data-theme="nordic-slate"] {
  --color-bg: #1e2327;
  --color-surface: #252b30;
  --color-border: #2e363d;
  --color-text: #d4dce3;
  --color-text-muted: #6b7e8d;
  --color-accent: #89c4cf;
}

/* Soft Dusk — Mørk */
[data-theme="soft-dusk"] {
  --color-bg: #1e1a24;
  --color-surface: #252030;
  --color-border: #332c42;
  --color-text: #d9cfe8;
  --color-text-muted: #7a6e94;
  --color-accent: #c9a0b4;
}

/* Tokyo Night — Mørk */
[data-theme="tokyo-night"] {
  --color-bg: #1a1b2e;
  --color-surface: #1f2040;
  --color-border: #2a2c4a;
  --color-text: #c0caf5;
  --color-text-muted: #565f89;
  --color-accent: #7aa2f7;
}

/* Paper & Ink — Lys */
[data-theme="paper-ink"] {
  --color-bg: #f5f0e8;
  --color-surface: #ede8e0;
  --color-border: #d4cdc3;
  --color-text: #1a1714;
  --color-text-muted: #6b6560;
  --color-accent: #3d3530;
}

/* Lavender Fog — Lys */
[data-theme="lavender-fog"] {
  --color-bg: #f0edf5;
  --color-surface: #e8e3f0;
  --color-border: #d0c8e0;
  --color-text: #2d2040;
  --color-text-muted: #7a6e94;
  --color-accent: #7c5cbf;
}

/* Iron Press — Lys */
[data-theme="iron-press"] {
  --color-bg: #f2f0ed;
  --color-surface: #eae8e4;
  --color-border: #d0cdc8;
  --color-text: #1c1a18;
  --color-text-muted: #706d68;
  --color-accent: #c0392b;
}
```

---

### 8. In-app notifikasjoner

**Hva det skal gjøre:**
- `NotificationBell` i TopBar viser badge med antall aktive varsler
- Klikk på bell → dropdown med liste over forfalt utlån
- Hvert varsel viser: utstyrsnavn, hvem som har det, hvor mange dager forfalt
- "Marker som levert"-knapp direkte i dropdown → setter `returned: true`, fjerner varsel
- "Åpne i kalender"-snarvei → navigerer til kalendervisning med utlånet uthevet

**Varsel-typer i v1:**
- Forfalt utlån (endDate passert, returned: false)

---

### 9. Utstyrsliste-eksport (PDF)

**Hva det skal gjøre:**
- "Eksporter liste"-knapp i utstyrsregisteret
- Genererer en ryddig, printbar HTML-visning og eksporterer via `webContents.printToPDF()`
- Brukeren velger lagringssted via native save dialog
- PDF inneholder: navn, kategori, eier, status, serienummer, innkjøpspris

---

## Typografi

- **Primærfont:** Geist (god æøå-støtte, karakteristisk, gratis)
- **Monospace:** Geist Mono (for IDer, filstier, kode)
- Last ned og self-host i `assets/fonts/` — ikke CDN-avhengighet
- **Aldri** Inter, Roboto eller Arial som primærfont

---

## Testing

### Unit-tester (Vitest)

```
tests/unit/services/markdownService.test.ts
- parseProjectFile() — korrekt parsing av frontmatter + tasks
- serializeProjectFile() — korrekt Markdown output
- parseEquipmentFile() — alle felt korrekt mappet
- serializeLoanFile() — datoformat ISO 8601

tests/unit/utils/dateUtils.test.ts
- isDateInRange() — grenseverdier
- formatDisplayDate() — norsk datoformat
- isLoanOverdue() — returnert false + endDate passert

tests/unit/utils/markdownUtils.test.ts
- slugify() — æøå, spesialtegn, tomme strenger
- generateId() — unikhet, format
```

### Integrasjonstester (Vitest + mock fs)

```
tests/integration/projects.test.ts
- Opprett prosjekt → fil opprettes i korrekt mappe
- Arkiver prosjekt → status endres, fil beholdes

tests/integration/equipment.test.ts
- Opprett utstyr med eier → ownerId lagres korrekt

tests/integration/calendar.test.ts
- Overlappende utlån → kaster feil, ingen fil opprettes
- Utlån markert som returned → utstyrsstatus oppdateres
```

### E2E-tester (Playwright)

```
tests/e2e/onboarding.spec.ts
- Første oppstart viser onboarding steg 1
- Hopp over import → velg vault → velg theme → navigér til Prosjekter
- Importer slate-config.json → steg 2 og 3 forhåndsutfylles
- Avbryt file picker i steg 2 → forblir på steg 2

tests/e2e/projects.spec.ts
- Opprett prosjekt, legg til tasks og sub-tasks
- Arkiver prosjekt → forsvinner fra liste, vises med "Vis arkiverte"

tests/e2e/equipment.spec.ts
- Opprett utstyr med eier valgt fra liste
- Forsøk å slette utstyr på utlån → blokkeres

tests/e2e/calendar.spec.ts
- Legg til shoot-dag og utlånsperiode, verifiser begge i kalender
- Forfalt utlån → badge vises i NotificationBell

tests/e2e/theme.spec.ts
- Bytt mellom alle 6 temaer, verifiser CSS-variabel endres
```

---

## Workflow-regler

### Under bygging av v1

- Ingen PR-krav — skriv kode direkte
- Commit-meldinger kortfattede og beskrivende på engelsk (`feat: add loan overlap validation`)
- Branch kan være `main` eller en enkelt `dev`-branch

### Aktivering av PR-krav (etter v1)

Når du mener v1 er ferdig og klar for review, **stopp og spør eksplisitt:**

```
"V1 ser ut til å være ferdig. Alle features er implementert og testene passerer.
Vil du bekrefte at vi er fornøyde med v1 og aktivere PR-only workflow for videre utvikling?"
```

Vent på bekreftelse fra Stephan. Først etter "ja" gjelder disse reglene:

- **Alle kodeendringer via Pull Request** — ingen direkte commits til `main`
- **Branch-navn:** `feature/beskrivelse` eller `fix/beskrivelse`
- Ingen hardkodede secrets — bruk `.env`, legg i `.gitignore`

---

## Første steg Claude Code skal ta

Ikke skriv kode før dette er gjort:

1. Les hele denne filen
2. Bekreft tech stack og forklar kort hvorfor det passer prosjektet
3. List opp alle `npm install`-kommandoer som skal kjøres
4. Opprett filstrukturen definert ovenfor (tomme filer der det er hensiktsmessig)
5. Still ETT oppklarende spørsmål hvis noe er genuint uklart — ikke mer

Start deretter med **Feature 1: Onboarding & Vault-oppsett**.

---

## Definition of Done

Beta er ferdig når:

- [ ] Onboarding fungerer: vault velges, theme velges, mappestruktur opprettes
- [ ] Prosjekter kan opprettes, redigeres og arkiveres — data lagres som Markdown
- [ ] Tasks og sub-tasks kan legges til, redigeres og hakas av
- [ ] Arkiverte prosjekter vises/skjules via filter
- [ ] Utstyr kan registreres med eier valgt fra liste — data lagres som Markdown
- [ ] Eiere kan legges til og redigeres i Settings
- [ ] Utlånsperioder kan opprettes og vises i kalender
- [ ] Overlappende utlån blokkeres med tydelig feilmelding
- [ ] Forfalt utlån vises som in-app notifikasjon med "marker som levert"-funksjon
- [ ] Kits kan opprettes og knyttes til utstyr, utilgjengelig utstyr markeres
- [ ] Shoot-dager kan opprettes og vises i kalender
- [ ] Alle 6 temaer fungerer og bytter uten reload
- [ ] Valgt tema lagres og gjenopprettes ved oppstart
- [ ] Export og import av userdata (slate-config.json + /Slate/-mappen) fungerer som zip
- [ ] Utstyrsliste kan eksporteres som PDF
- [ ] `fs.watch` fanger opp endringer fra Obsidian og oppdaterer UI
- [ ] Alle unit-tester passerer (`npm test`)
- [ ] Alle E2E-tester passerer (`npm run test:e2e`)
- [ ] Appen kan pakkes som `.dmg` (macOS) og `.exe` (Windows)
- [ ] Ingen hardkodede secrets i source
- [ ] All UI-tekst er på norsk
- [ ] README.md er komplett
- [ ] All kode er linted og formatert
- [ ] Claude Code har spurt Stephan om bekreftelse for PR-aktivering

---

## Teknisk kontekst

- Utviklingsmaskin: MacBook Pro (Apple Silicon / M-chip)
- Kodestandard: ren, lesbar, vedlikeholdbar — som om en senior developer reviewer det
- Foretrekk klarhet over cleverness
- Alle asynkrone operasjoner skal håndtere feil eksplisitt (ingen silent failures)
- File system-operasjoner skjer alltid i Electron main process via IPC — aldri direkte fra renderer
- UI-språk: norsk

---

*Generert av Claude — Stephan Teig — 2026-06-03*
