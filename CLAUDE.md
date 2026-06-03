# CLAUDE.md — Slate
> Dette er en ferdig generert spesifikasjon klar for Claude Code.
> Les hele filen før du skriver én linje kode.
> Start med `/goal` som definert nedenfor.

---

## /goal

```
Bygg Slate — et cross-platform Electron-dashboard for videoproduksjon.
Appen lagrer all data som Markdown-filer i en Obsidian-vault.
MVP inkluderer: prosjekt-todo, utstyrsregister, utlånskalender, utstyrskits, shoot-kalender, onboarding og theme-switcher.
Appen skal være beta-klar: stabil, testet og pakket som .dmg og .exe.
```

---

## Prosjekt

**Navn:** Slate
**Beskrivelse:** Cross-platform produksjonsdashboard for videoskapere — styrer prosjekter, utstyr og kalender, og lagrer alt som Markdown i Obsidian-vaulten.
**Problem den løser:** Ingen samlet plass å styre videoproduksjonsprosjekter, utstyr og shoot-dager
**Versjon:** 1.0.0 (Beta)

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
| Build | `electron-builder` | Produserer `.dmg` og `.exe` |
| Testing | Vitest + Playwright | Vitest for unit/integration, Playwright for E2E og UI/UX-agenter |
| Linting | ESLint + Prettier | Konsistent kodestil |
| Package manager | npm | Standard |

---

## Avhengigheter & Oppsett

Kjør disse kommandoene i rekkefølge **før du skriver kode**:

```bash
# 1. Initialiser prosjekt
npm init -y

# 2. Core dependencies
npm install electron react react-dom gray-matter date-fns

# 3. TypeScript og typer
npm install --save-dev typescript @types/react @types/react-dom @types/node

# 4. Tailwind
npm install --save-dev tailwindcss autoprefixer postcss

# 5. Vite + Electron Forge (eller electron-vite)
npm install --save-dev electron-vite @electron-forge/cli

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
│   │   ├── ipc/
│   │   │   ├── projects.ts       # IPC handlers: prosjekter
│   │   │   ├── equipment.ts      # IPC handlers: utstyr
│   │   │   ├── calendar.ts       # IPC handlers: kalender
│   │   │   ├── kits.ts           # IPC handlers: kits
│   │   │   └── vault.ts          # IPC handlers: vault-konfigurasjon
│   │   └── services/
│   │       ├── vaultService.ts   # Lese/skrive til Obsidian vault
│   │       ├── markdownService.ts # Markdown + frontmatter håndtering
│   │       └── configService.ts  # App-konfigurasjon (slate-config.json)
│   ├── renderer/
│   │   ├── index.html
│   │   ├── main.tsx              # React entry
│   │   ├── App.tsx               # Root komponent + routing
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── MainPanel.tsx
│   │   │   │   └── TopBar.tsx
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
│   │   │   │   └── KitList.tsx
│   │   │   ├── calendar/
│   │   │   │   ├── CalendarView.tsx
│   │   │   │   ├── ShootDayForm.tsx
│   │   │   │   └── LoanOverlay.tsx
│   │   │   ├── settings/
│   │   │   │   ├── SettingsPanel.tsx
│   │   │   │   └── ThemeSwitcher.tsx
│   │   │   └── onboarding/
│   │   │       ├── OnboardingFlow.tsx
│   │   │       └── VaultPicker.tsx
│   │   ├── hooks/
│   │   │   ├── useProjects.ts
│   │   │   ├── useEquipment.ts
│   │   │   ├── useCalendar.ts
│   │   │   ├── useKits.ts
│   │   │   └── useTheme.ts
│   │   ├── store/
│   │   │   └── appStore.ts       # Global state (React Context eller Zustand)
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
├── agents/
│   ├── uiux-agent.ts             # Playwright-agent som tester UX-flyt
│   └── accessibility-agent.ts    # Sjekker WCAG-kontrast per tema
├── assets/
│   ├── icons/
│   │   ├── icon.icns             # macOS
│   │   ├── icon.ico              # Windows
│   │   └── icon.png              # 512x512
│   └── fonts/
│       └── (Geist eller Departure Mono hvis self-hosted)
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

### shared/types/equipment.ts
```typescript
export type EquipmentStatus = 'available' | 'on-loan' | 'in-service' | 'retired';

export interface Equipment {
  id: string;
  name: string;
  category: string;
  owner: string;
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
  shotType: string;       // f.eks. "Interview", "Run & Gun", "Cinematic"
  equipmentIds: string[];
  notes?: string;
}
```

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
owner: Stephan
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

**Hva det skal gjøre:**
- Vis onboarding-skjerm ved første oppstart (ingen `slate-config.json` funnet)
- Bruker velger Obsidian vault root via native file picker
- Appen oppretter `/Slate/`-mappestruktur i vaulten
- Lagrer config til `slate-config.json` ved siden av vaulten (ikke inne i den)
- Etter onboarding: gå rett til Prosjekter-visningen

**Edge cases:**
- Brukeren velger en mappe som ikke eksisterer → vis feilmelding, ikke krasj
- Brukeren velger en mappe uten skriverettigheter → vis forklarende feilmelding
- `/Slate/`-mappen eksisterer allerede → ikke overskriv, importer eksisterende data
- Brukeren avbryter file picker → vis onboarding igjen, ikke gå videre
- Vault-stien endres i Settings → migrer ikke data, bare oppdater config og last inn på nytt
- Manglende `slate-config.json` ved oppstart etter onboarding → gå til onboarding igjen

---

### 2. Prosjekt-todo

**Hva det skal gjøre:**
- Liste over prosjekter i sidebar/main-panel
- Opprett prosjekt: navn, status (planning/in-progress/delivered/archived), valgfri Dropbox-URL
- Inne i prosjekt: hierarkisk task-liste (tasks og sub-tasks, maks 2 nivåer i v1)
- Hak av tasks og sub-tasks
- Slett prosjekt (med bekreftelsesdialog)
- Rediger prosjektnavn og status
- Prosjektfiler lagres umiddelbart til Markdown ved endring

**Edge cases:**
- Tomt prosjektnavn → valider, ikke lagre
- Ugyldig Dropbox-URL (ikke https://) → advar, men tillat lagring
- Slette et prosjekt som har utlån knyttet til seg → advar, ikke slett stille
- Prosjektfil manuelt slettet fra vaulten → vis "ikke funnet"-tilstand i UI, ikke krasj
- Veldig lang task-tittel → wrap tekst, ikke overflow
- Spesialtegn i prosjektnavn (æøå, emojis) → slugify til filnavn, behold visningsnavn
- Samtidig redigering av samme fil eksternt og i appen → last inn på nytt ved vindusfokus

---

### 3. Utstyrsregister

**Hva det skal gjøre:**
- Liste over alt utstyr med søk og filtrer på kategori og status
- Opprett utstyr: navn, kategori, eier, serienummer (valgfritt), innkjøpspris (valgfritt), status, notater
- Rediger utstyrskort
- Slett utstyr (med bekreftelsesdialog)
- Statusendring direkte fra kortvisning

**Edge cases:**
- Slette utstyr som er på utlån → blokkér sletting, vis hvem som har det
- Slette utstyr som inngår i ett eller flere kits → advar, fjern fra kit automatisk
- Duplikat serienummer → advar, ikke blokkér (kan være feil i registeret)
- Negativt innkjøpspris → valider til 0 minimum
- Utstyrsfil manuelt redigert i Obsidian → last inn på nytt ved vindusfokus
- Ingen utstyr registrert → vis tom tilstand med CTA

---

### 4. Utlånskalender

**Hva det skal gjøre:**
- Opprett utlånsperiode: velg utstyr, lånedato (fra/til), navn på låntaker, valgfritt prosjekt
- Kalendervisning (månedsoversikt) med fargemarkering av utlånte dager
- Klikk på dag for å se hva som er utlånt
- Avslutt utlån (merk som levert tilbake)
- Utlånsstatus oppdaterer utstyrets status automatisk

**Edge cases:**
- Overlappende utlånsperioder for samme utstyr → blokkér med tydelig feilmelding
- Sluttdato før startdato → valider og blokkér
- Utlånsperiode som strekker seg over månedsskifte → vises korrekt i begge måneder
- Utstyr satt til "in-service" mens det har aktiv utlånsperiode → advar
- Utlånet er i fortiden (ikke avsluttet) → marker som "forfalt" i UI
- Ingen fremtidige utlån → vis tom tilstand

---

### 5. Utstyrskits

**Hva det skal gjøre:**
- Opprett kit: navn, shot-type, liste over utstyr (velg fra registeret), notater
- Vis kit med utstyrsliste og tilgjengelighet per utstyrsenhet
- Rediger kit
- Slett kit

**Edge cases:**
- Utstyr i kit er på utlån → marker som utilgjengelig i kit-visningen, ikke fjern fra kit
- Utstyr slettes fra registeret → fjern automatisk fra alle kits, vis advarsel
- Tom kit (ingen utstyr valgt) → tillat lagring, vis advarsel i UI
- Duplikat kit-navn → advar, ikke blokkér

---

### 6. Shoot-kalender

**Hva det skal gjøre:**
- Legg til shoot-dag: dato, tittel, valgfri lokasjon, valgfritt prosjekt, valgfritt utstyr
- Kalendervisning viser shoot-dager og utlånsdager i samme view (forskjellig farge)
- Klikk på shoot-dag for detaljer
- Rediger og slett shoot-dag

**Edge cases:**
- Samme dato som eksisterende shoot-dag → tillat (kan ha to shoots på samme dag)
- Utstyr valgt på shoot-dag er allerede utlånt → advar, ikke blokkér
- Shoot-dag i fortiden → tillat, vis visuelt som "passert"
- Slett shoot-dag: bekreftelsesdialog
- Prosjekt tilknyttet shoot-dag slettes → behold shoot-dag, fjern prosjekt-referansen

---

### 7. Theme-switcher

**Hva det skal gjøre:**
- Settings-panel med dropdown/grid for å velge mellom 6 Lumen-color schemes
- Tema bytter umiddelbart (ingen reload)
- Valgt tema lagres i `slate-config.json`
- Korrekt tema lastes ved oppstart

**Implementasjonsdetaljer:**
- Hvert tema definert som CSS custom properties på `:root`
- JavaScript bytter `data-theme`-attributt på `<html>` eller `<body>`
- Tailwind-klasser bruker CSS vars via `var(--color-bg)` etc.
- Alle 6 temaer:

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

**Edge cases:**
- Ukjent tema-verdi i config → fall tilbake til `nordic-slate`
- Config-fil korrupt → fall tilbake til defaults, regenerer config
- Tema-bytte midt i en modal → modal bytter tema umiddelbart

---

## Testing

### Unit-tester (Vitest)

Test disse funksjonene isolert:

```
tests/unit/services/markdownService.test.ts
- parseProjectFile() — korrekt parsing av frontmatter + tasks
- serializeProjectFile() — korrekt Markdown output
- parseEquipmentFile() — alle felt korrekt mappet
- serializeLoanFile() — datoformat ISO 8601

tests/unit/utils/dateUtils.test.ts
- isDateInRange() — grenseverdier (start = slutt, start > slutt)
- formatDisplayDate() — norsk datoformat
- getMonthDays() — skuddår, januar/desember

tests/unit/utils/markdownUtils.test.ts
- slugify() — æøå, spesialtegn, tomme strenger, duplikater
- generateId() — unikhet, format
```

### Integrasjonstester (Vitest + mock fs)

```
tests/integration/projects.test.ts
- Opprett prosjekt → fil opprettes i korrekt mappe
- Oppdater task → fil oppdateres, ikke overskrives
- Slett prosjekt → fil fjernes

tests/integration/equipment.test.ts
- Opprett utstyr → fil opprettes
- Endre status → frontmatter oppdateres

tests/integration/calendar.test.ts
- Opprett shoot-dag → fil opprettes med korrekt dato i filnavn
- Overlappende utlån → kaster feil, ingen fil opprettes
```

### E2E-tester (Playwright)

```
tests/e2e/onboarding.spec.ts
- Første oppstart viser onboarding
- Velg gyldig mappe → mappestruktur opprettes → navigér til Prosjekter
- Avbryt file picker → onboarding vises igjen

tests/e2e/projects.spec.ts
- Opprett prosjekt med alle felt
- Legg til task og sub-task
- Hak av task → visuell tilbakemelding
- Slett prosjekt med bekreftelse

tests/e2e/equipment.spec.ts
- Opprett utstyr
- Sett status til "on-loan"
- Forsøk å slette utstyr på utlån → blokkeres

tests/e2e/calendar.spec.ts
- Legg til shoot-dag
- Opprett utlånsperiode
- Verifiser at begge vises i kalendervisning

tests/e2e/theme.spec.ts
- Bytt mellom alle 6 temaer
- Verifiser at CSS-variabelen --color-bg endres
- Verifiser at valgt tema er lagret etter restart (mock config)
```

---

## UI/UX-agenter (Playwright)

### agents/uiux-agent.ts

Denne agenten kjøres manuelt eller i CI for å evaluere UX-kvalitet:

```typescript
/**
 * UX-agent — evaluerer brukeropplevelse i Slate
 *
 * Kjør med: npx ts-node agents/uiux-agent.ts
 *
 * Agenten:
 * 1. Starter Slate-appen via Playwright
 * 2. Gjennomfører komplette brukerflyter
 * 3. Måler og rapporterer:
 *    - Tid fra klikk til respons (< 100ms forventet)
 *    - Antall klikk for å fullføre vanlige oppgaver
 *    - Manglende tom-tilstander (empty states)
 *    - Manglende feilmeldinger ved feil input
 * 4. Genererer rapport: agents/reports/uiux-report-<dato>.md
 */

const UX_FLOWS = [
  {
    name: 'Opprett prosjekt',
    maxClicks: 4,
    steps: ['Åpne Prosjekter', 'Klikk Ny', 'Fyll inn navn', 'Lagre']
  },
  {
    name: 'Registrer utstyr og lag kit',
    maxClicks: 10,
    steps: ['Gå til Utstyr', 'Opprett utstyr', 'Gå til Kits', 'Opprett kit', 'Legg til utstyr']
  },
  {
    name: 'Opprett utlån',
    maxClicks: 6,
    steps: ['Gå til Kalender', 'Klikk på dag', 'Velg utstyr', 'Sett datoer', 'Lagre']
  }
];
```

### agents/accessibility-agent.ts

```typescript
/**
 * Accessibility-agent — sjekker WCAG AA per tema
 *
 * Kjør med: npx ts-node agents/accessibility-agent.ts
 *
 * Sjekker per tema:
 * - Kontrastratio tekst/bakgrunn (minimum 4.5:1 for normal tekst)
 * - Kontrastratio stor tekst (minimum 3:1)
 * - Focus-ring synlighet
 * - Alle interaktive elementer har aria-label eller synlig tekst
 *
 * Genererer rapport: agents/reports/accessibility-report-<dato>.md
 */
```

---

## Dokumentasjon

### README.md (generer dette til slutt)

README skal inneholde:
1. Hva er Slate
2. Forutsetninger (Node, npm, Obsidian)
3. Kom i gang (clone, install, run)
4. Onboarding-steg
5. Mappestruktur i vaulten
6. Bygg og pakk (`.dmg` og `.exe`)
7. Kjør tester
8. Kjør UI/UX-agenter

### Inline-dokumentasjon

- Alle service-funksjoner skal ha JSDoc-kommentarer
- Komplekse utils skal ha inline-kommentarer
- IPC-handlere skal dokumentere hvilke feil de kan kaste

---

## Workflow-regler

Disse er absolutte og aldri forhandlingsbare:

- **Alle kodeendringer via Pull Request** — ingen direkte commits til `main`
- Eneste unntak: oppretting av nytt repo fra scratch
- **Branch-navn:** `feature/beskrivelse` eller `fix/beskrivelse`
- **Commit-meldinger:** kortfattede og beskrivende på engelsk (f.eks. `feat: add loan overlap validation`)
- **Før du oppretter en fil:** sjekk om den allerede eksisterer
- **Ved feil:** forsøk å fikse selv (maks 2 forsøk), rapporter deretter tydelig med full feilmelding
- **Ingen hardkodede secrets** — bruk `.env`, legg `.env` i `.gitignore`
- **Kodestandard:** ren, lesbar, vedlikeholdbar — som om en senior developer skal review det

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

- [ ] Onboarding fungerer: vault velges, mappestruktur opprettes
- [ ] Prosjekter kan opprettes, redigeres og slettes — data lagres som Markdown
- [ ] Tasks og sub-tasks kan legges til, redigeres og hakas av
- [ ] Utstyr kan registreres med alle felt — data lagres som Markdown
- [ ] Utlånsperioder kan opprettes og vises i kalender
- [ ] Overlappende utlån blokkeres med tydelig feilmelding
- [ ] Kits kan opprettes og knyttes til utstyr
- [ ] Shoot-dager kan opprettes og vises i kalender
- [ ] Alle 6 Lumen-temaer fungerer og bytter uten reload
- [ ] Valgt tema lagres og gjenopprettes ved oppstart
- [ ] Alle unit-tester passerer (`npm test`)
- [ ] Alle E2E-tester passerer (`npm run test:e2e`)
- [ ] UI/UX-agent kjører uten kritiske feil
- [ ] Accessibility-agent: alle temaer passerer WCAG AA for kontrast
- [ ] Appen kan pakkes som `.dmg` (macOS) og `.exe` (Windows)
- [ ] Ingen hardkodede secrets i source
- [ ] README.md er komplett
- [ ] All kode er linted og formatert

---

## Teknisk kontekst

- Utviklingsmaskin: MacBook Pro (Apple Silicon / M-chip)
- Kodestandard: ren, lesbar, vedlikeholdbar — som om en senior developer reviewer det
- Foretrekk klarhet over cleverness
- Alle asynkrone operasjoner skal håndtere feil eksplisitt (ingen silent failures)
- File system-operasjoner skjer alltid i Electron main process via IPC — aldri direkte fra renderer

---

*Generert av Claude — Stephan Teig — 2026-06-03*
