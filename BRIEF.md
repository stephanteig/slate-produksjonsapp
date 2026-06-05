# BRIEF.md — Slate: Produksjonsdashboard
> Planleggingsdokument for Stephan Teig
> Dato: 2026-06-03 (oppdatert)

---

## Sammendrag

**Slate** er et cross-platform desktop-dashboard for videoproduksjon. Det samler prosjektstyring, utstyrshåndtering og kalender i én app — og lagrer all data som Markdown-filer direkte i Obsidian-vaulten.

---

## Seksjon 1 — Idé & Problem

| Felt | Svar |
|------|------|
| Idé | Et sentralt kontrollpanel for alt relatert til videoproduksjon |
| Problem | Ingen samlet plass å styre prosjekter, utstyr og shoot-dager |
| Brukere | Bare Stephan (v1) |
| Inspirasjon | Eget Obsidian-workflow + Lumen-temaet |

---

## Seksjon 2 — Features

### MVP (v1)

1. **Prosjekt-todo** — Opprett prosjekter med navn, status og hierarkiske sub-tasks. Hvert prosjekt har et felt for Dropbox-leveringslenke. Prosjekter slettes aldri — de arkiveres og beholdes.
2. **Utstyrsregister** — Liste over alt utstyr med: navn, kategori, eier (valgt fra en liste av registrerte eiere), serienummer, innkjøpspris, notater. Statusfelt: tilgjengelig / utlånt / til service.
3. **Utlånskalender** — Kalendervisning som viser hvilke dager utstyr er utlånt. Kan opprette utlånsperioder knyttet til utstyr og prosjekt. Forfalt utstyr utløser in-app notification.
4. **Utstyrskits** — Pakker av anbefalt utstyr for ulike shot-typer (f.eks. "Interview Kit", "Run & Gun Kit"). Knyttet til spesifikke utstyrsenheter. Utilgjengelig utstyr markeres, men blokkerer ikke.
5. **Shoot-kalender** — Kalender for shoot-dager, integrert med utlånskalenderen. Shoot-dager vises visuelt i kalenderen.
6. **Onboarding** — Tre-stegs oppsett: (1) Importer `slate-config.json` fra annen maskin for å forhåndsutfylle resten — valgfritt. (2) Velg vault root, med mulighet til å importere en eksisterende `/Slate/`-mappe. (3) Velg default theme. Kan bytte vault-mappe og theme i Settings. Full userdata-eksport/-import (config + `/Slate/`-mappe som zip) tilgjengelig i Settings.
7. **Theme-switcher** — 6 color schemes fra Lumen-temaet, valgt under onboarding og tilgjengelig i Settings.
8. **In-app notifikasjoner** — Varsler for forfalt utlån med snarvei til å markere utstyr som levert.
9. **Utstyrliste-eksport** — Print/eksport av utstyrsliste som PDF.

### Ikke i v1 (planlagt v2)

- YouTube/sosiale medier-integrasjon
- Render-køvisning (DaVinci)
- Flerbruker / deling
- Mobil-tilgang
- Automatisk backup til sky
- Sortering av utstyr per eier

---

## Seksjon 3 — Platform & Distribusjon

| Plattform | Prioritet | Installer |
|-----------|-----------|-----------|
| macOS | Primær | `.dmg` |
| Windows | Sekundær | `.exe` |

- Distribueres kun til Stephan i v1 (ingen App Store, ingen lisens)
- Appen trenger kun internett for Dropbox-lenker (åpnes i nettleser)

---

## Seksjon 4 — UI & Design

### Design-prinsipp

Slate følger samme design-DNA som Lumen-temaet: karakteristisk typografi, sterk hierarki, tydelige aksenter. Ikke generisk SaaS-dashboard.

### Theme-switcher — 6 Lumen-skjemaer

| Navn | Modus | Stemning |
|------|-------|----------|
| Nordic Slate | Mørk | Desaturert blå-grå, is-blå aksenter |
| Soft Dusk | Mørk | Mauve-lilla, dusty rose |
| Tokyo Night | Mørk | Dyp indigo, elektrisk blå/violet |
| Paper & Ink | Lys | Varm off-white, near-black |
| Lavender Fog | Lys | Desaturert lilla-hvit, plum aksenter |
| Iron Press | Lys | Newsprint grå, crimson aksent |

### Typografi

- Primærfont: **Geist** (god lesbarhet, støtter æøå, karakteristisk uten å være generisk)
- Sekundærfont: **Geist Mono** for kode, filstier, IDer
- Ikke Inter, Roboto eller Arial

### Layout

- Sidebar-navigasjon: Prosjekter / Utstyr / Kalender / Settings
- Innhold i main-panel med kontekstuell topp-navigasjon
- Appen er på **norsk** — all UI-tekst, feilmeldinger og labels

---

## Seksjon 5 — Data & Lagring

### Filosofi

All data lagres som Markdown-filer i Obsidian-vaulten. Filene skal være lesbare uten appen.

### App-konfigurasjon

`slate-config.json` lagres i Electrons `userData`-mappe (ikke i vaulten). Inneholder kun: vault-sti og valgt tema. Dette er standard for Electron-apper og forurenser ikke vaulten.

### Mappestruktur i Obsidian

```
<vault-root>/
└── Slate/
    ├── projects/
    │   └── <prosjektnavn>/
    │       ├── project.md       # Metadata, status, Dropbox-lenke
    │       └── tasks.md         # Todo-liste med sub-tasks
    ├── equipment/
    │   ├── <utstyrsnavn>.md     # Utstyrskort
    │   └── loans/
    │       └── <dato>-<utstyr>.md
    ├── kits/
    │   └── <kitnavn>.md         # Utstyrspakke
    └── calendar/
        └── <dato>.md            # Shoot-dag med linker til utstyr og prosjekt
```

### Eierregistrering

Eiere lagres som en enkel liste i `slate-config.json` (navn og valgfri ID). Utstyr knytter seg til eier via ID. Dette legger til rette for sortering per eier i v2.

### Prosjekt-arkivering

Prosjekter slettes **aldri** fra filsystemet. Status `archived` er det eneste "slettet"-konseptet. Slette-knappen i UI setter status til `archived` med bekreftelsesdialog. Arkiverte prosjekter kan vises/skjules via filter.

### Export / Import

Settings-panelet har to knapper:
- **Eksporter userdata** — zipper `slate-config.json` + `/Slate/`-mappen til én fil og lagrer til valgt lokasjon. Denne filen kan tas med til en annen maskin.
- **Importer userdata** — velg en eksportert zip → pakker ut config og `/Slate/`-mappe. Spør om vault-stien fra filen skal beholdes eller om bruker vil velge en ny. Gjør det mulig å flytte hele Slate-oppsettet mellom maskiner på sekunder.

### Sensitiv data

- Ingen passord lagres
- Dropbox-lenker lagres kun som URL i Markdown
- `slate-config.json` inneholder kun vault-sti og tema-preferanse

---

## Seksjon 6 — Teknisk Kontekst

### Tech Stack

| Lag | Valg | Begrunnelse |
|-----|------|-------------|
| Framework | Electron | Cross-platform Mac+Windows, god file system-tilgang, stor community |
| Språk | TypeScript | Typesikkerhet, bedre DX |
| UI | React 18 | Komponent-basert, god med Electron |
| Styling | Tailwind CSS + CSS variables | Tailwind for layout, CSS vars for theme-switching |
| Filhåndtering | Node.js `fs` via IPC (Electron main process) | Sikker og korrekt Electron-arkitektur |
| Vault-watching | `fs.watch` + vindusfokus-reload | Robust mot endringer fra Obsidian |
| Datoer | `date-fns` | Lett, tree-shakeable |
| Markdown | `gray-matter` | Frontmatter parsing |
| Notifikasjoner | Electrons `Notification` API | In-app varsler uten tredjepartsavhengigheter |
| Zip/unzip | `adm-zip` | Export/import av userdata mellom maskiner |
| PDF-eksport | `electron-print-to-pdf` / `puppeteer-core` | Utstyrliste-eksport |
| Build | `electron-builder` | Produserer `.dmg` og `.exe` |
| Testing | Vitest + Playwright | Unit/integration + E2E |
| Package manager | npm | Standard |

### IPC-arkitektur

Renderer (React) kommuniserer med main process via IPC-kanaler for all fil- og OS-operasjoner. Renderer har aldri direkte tilgang til `fs`. Eksempel-flyt:

```
React-komponent → window.electronAPI.saveProject(data) → IPC → main/ipc/projects.ts → fs.writeFile()
```

### Unngå

- Ingen database (SQLite etc.) — alt i Markdown
- Ikke web-app
- Ingen cloud-sync i v1
- Ikke Fusion (DaVinci)

---

## Seksjon 7 — Scope & Tidslinje

- **V1 er ferdig når:** Alle 9 MVP-features fungerer, appen er stabil nok til daglig bruk
- **PR-workflow:** Gjelder etter at Stephan bekrefter at v1 ser bra ut. Claude Code ber eksplisitt om bekreftelse før PR-krav aktiveres.
- **Haster:** Ja — målet er beta-klar v1
- **Teknisk gjeld:** Minimal — koden skal holde lenge

---

## Seksjon 8 — Claude Code Skill

Prosjektet inkluderer en `slate:create-content`-skill for Claude Code som genererer korrekt formaterte vault-filer (kit, utstyr, shotlist, prosjekt, shoot-dag) uten å åpne appen.

**Plassering i repoet:** `skills/slate:create-content/SKILL.md`

**Installer lokalt:**
```bash
cp skills/slate:create-content/SKILL.md ~/.claude/skills/slate:create-content/SKILL.md
```

Skillen kjenner alle Slates datamodeller, slugify-regler og frontmatter-format, og kan generere fullstendige testdata-pakker eller on-set-klar innhold på én kommando.

---

## Beslutninger & Begrunnelser

| Beslutning | Begrunnelse |
|------------|-------------|
| Electron over Tauri | Raskere å komme i gang, bredere community, ingen Rust-krav |
| Markdown over SQLite | Obsidian-kompatibilitet, lesbare filer, ingen migrering |
| Tailwind + CSS vars | Tailwind for layout-speed, CSS vars for theme-switching uten klasse-bytter |
| Ingen sky i v1 | Unødvendig kompleksitet — vaulten synkes via Obsidians egne mekanismer |
| gray-matter | Beste bibliotek for YAML frontmatter i Node/TypeScript |
| config i userData | Holder config utenfor vaulten, standard Electron-mønster |
| fs.watch for vault | Mer robust enn kun focus-reload — fanger endringer fra Obsidian umiddelbart |
| Arkivering over sletting | Videoprosjekter har langvarig verdi — ingenting skal kunne forsvinne ved et uhell |
| Eier som liste i config | Enkel v1-løsning som er kompatibel med sortering per eier i v2 |
| adm-zip for export/import | Lett Node.js-bibliotek for zip/unzip, fungerer i Electron main process uten native binaries |

---

*Generert av Claude — Stephan Teig — 2026-06-03*
| Geist som primærfont | God æøå-støtte, karakteristisk, gratis, produsert av Vercel |
