# BRIEF.md — Slate: Produksjonsdashboard
> Planleggingsdokument for Stephan Teig
> Dato: 2026-06-03

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

1. **Prosjekt-todo** — Opprett prosjekter med navn, status og hierarkiske sub-tasks. Hvert prosjekt har et felt for Dropbox-leveringslenke.
2. **Utstyrsregister** — Liste over alt utstyr med: navn, kategori, eier, serienummer, innkjøpspris, notater. Statusfelt: tilgjengelig / utlånt / til service.
3. **Utlånskalender** — Kalendervisning som viser hvilke dager utstyr er utlånt. Kan opprette utlånsperioder knyttet til utstyr og prosjekt.
4. **Utstyrskits** — Pakker av anbefalt utstyr for ulike shot-typer (f.eks. "Interview Kit", "Run & Gun Kit"). Knyttet til spesifikke utstyrsenheter.
5. **Shoot-kalender** — Kalender for shoot-dager, integrert med utlånskalenderen. Shoot-dager vises visuelt i kalenderen.
6. **Onboarding** — Første gangs oppsett: velg Obsidian vault root → appen oppretter `/Slate/`-mappe med understruktur.
7. **Theme-switcher** — 6 color schemes fra Lumen-temaet, tilgjengelig i Settings.

### Ikke i v1 (planlagt v2)

- YouTube/sosiale medier-integrasjon
- Render-køvisning (DaVinci, Premiere)
- Flerbruker / deling
- Mobil-tilgang
- Automatisk backup til sky

---

## Seksjon 3 — Platform & Distribusjon

| Plattform | Prioritet | Installer |
|-----------|-----------|-----------|
| macOS | Primær | `.dmg` |
| Windows | Sekundær | `.exe` |

- Distribueres kun til Stephan i v1 (ingen App Store, ingen lisens)
- Appen trenger kun internett for Dropbox-lenker (åpner i nettleser)

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

- Primærfont: **Geist** eller **Departure Mono** (karakteristisk, ikke generisk)
- Ikke Inter, Roboto eller Arial

### Layout

- Sidebar-navigasjon: Prosjekter / Utstyr / Kalender / Settings
- Innhold i main-panel med kontekstuell topp-navigasjon

---

## Seksjon 5 — Data & Lagring

### Filosofi

All data lagres som Markdown-filer i Obsidian-vaulten. Filene skal være lesbare uten appen.

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
    ├── calendar/
    │   └── <dato>.md            # Shoot-dag med linker til utstyr og prosjekt
    └── slate-config.json        # App-konfigurasjon (vault-sti, valgt tema)
```

### Markdown-format eksempel (project.md)

```markdown
---
title: Prosjektnavn
status: in-progress
created: 2026-06-03
dropbox: https://www.dropbox.com/sh/...
tags: [slate, project]
---

## Leveranse
- [ ] Råklipp levert
- [ ] Fargegrading ferdig
  - [ ] Scene 1
  - [ ] Scene 2
- [ ] Eksportert til Dropbox
```

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
| Språk | TypeScript | Typesikkerhet, bedre DX, foretrekkes av Claude Code |
| UI | React | Komponent-basert, god med Electron |
| Styling | Tailwind CSS + CSS variables | Tailwind for layout, CSS vars for theme-switching |
| Filhåndtering | Node.js `fs` via Electron main process | Direkte Markdown-skriving |
| Datoer | `date-fns` | Lett, tree-shakeable |
| Markdown | `gray-matter` | Frontmatter parsing |
| Build | `electron-builder` | Produserer `.dmg` og `.exe` |
| Package manager | npm | Standard |

### Integrasjoner

- Obsidian vault: direkte filsystem (ingen API)
- Dropbox: kun URL-lenker, åpnes i nettleser via `shell.openExternal()`

### Unngå

- Ingen database (SQLite etc.) — alt i Markdown
- Ikke web-app
- Ingen cloud-sync i v1

---

## Seksjon 7 — Scope & Tidslinje

- **V1 er ferdig når:** Alle 7 MVP-features fungerer, appen er stabil nok til daglig bruk av Stephan
- **Haster:** Ja — målet er beta-klar v1
- **Teknisk gjeld:** Minimal — koden skal holde lenge

---

## Beslutninger & Begrunnelser

| Beslutning | Begrunnelse |
|------------|-------------|
| Electron over Tauri | Raskere å komme i gang, bredere community, ingen Rust-krav |
| Markdown over SQLite | Obsidian-kompatibilitet, lesbare filer, ingen migrering |
| Tailwind + CSS vars | Tailwind for layout-speed, CSS vars for theme-switching uten klasse-bytter |
| Ingen sky i v1 | Unødvendig kompleksitet — vaulten synkes via Obsidians egne mekanismer |
| gray-matter | Beste bibliotek for YAML frontmatter i Node/TypeScript |

---

*Generert av Claude — Stephan Teig — 2026-06-03*
