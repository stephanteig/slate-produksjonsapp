# Slate

Cross-platform produksjonsdashboard for videoskapere. Lagrer all data som Markdown-filer i en Obsidian-vault.

## Features

### Ferdig ✅
- [x] **Onboarding** — vault-valg, theme-valg, mappestruktur
- [x] **Prosjekt-todo** — opprett, rediger, arkiver, hierarkiske tasks med sub-tasks
- [x] **Utstyrsregister** — katalog med eiere, kategorier, status, PDF-eksport
- [x] **Utlånskalender** — overlappvalidering, forfalt-varsler, "marker som levert"
- [x] **Utstyrskits** — pakk utstyr i gjenbrukbare kits med tilgjengelighetsstatus
- [x] **Shoot-kalender** — planlegg shoot-dager med utstyr og prosjekttilknytning
- [x] **6 temaer** — live theme-switching uten reload (Nordic Slate, Soft Dusk, Tokyo Night, Paper & Ink, Lavender Fog, Iron Press)
- [x] **Dataportabilitet** — eksporter og importer alt som ZIP
- [x] **In-app notifikasjoner** — badge og dropdown for forfalte utlån
- [x] **fs.watch** — automatisk oppdatering når Obsidian endrer filer i vaulten

### Planlagt 🗓
- [ ] **Shotlister** — scener, shot/note/quote-rader, global nummerering, autolargring
- [ ] **Shot-detaljer** — shot size, linse, bevegelse, storyboard-bilde per shot
- [ ] **Moodboard** — last opp referansebilder per shotlist
- [ ] **9 maler** — Boligfoto, Intervju, Social Media, Event, Produktfoto, Podcast Video, Testimonial, Behind the Scenes, Brand Film
- [ ] **Forhåndsvisning** — statistikk, fremgangsbar, ren tekst-output, kopier til utklippstavle
- [ ] **PDF-eksport av shotlist** — utskriftsvennlig versjon med storyboard-bilder
- [ ] **PDF-eksport av shoot-dag** — dato, crew, shotlister og utstyr samlet
- [ ] **Crew-felt på shoot-dager** — hvem er med på shooten
- [ ] **Importer fra Markr** — les .swshot-filer og konverter til Slate-shotlister
- [ ] **.dmg og .exe pakking** — distribusjonsklar for macOS og Windows

## Kom i gang

```bash
npm install
npm run dev
```

## Bygg

```bash
npm run build       # produksjonsbygd
npm run dist:mac    # pakk som .dmg
npm run dist:win    # pakk som .exe
```

## Test

```bash
npm test            # alle unit- og integrasjonstester
npm run test:e2e    # E2E-tester (krever bygd app)
```

## Tech stack

| Lag | Valg |
|-----|------|
| Framework | Electron v42 |
| UI | React v19 + TypeScript v6 |
| Styling | Tailwind CSS v3 + CSS custom properties |
| Markdown | gray-matter |
| Build | electron-vite + electron-builder |
| Testing | Vitest + Playwright |

## Datastruktur

All data lagres i `<vault>/Slate/`:

```
Slate/
├── projects/<slug>/
│   ├── project.md
│   └── tasks.md
├── equipment/
│   ├── <slug>.md
│   └── loans/<dato>-<utstyr>.md
├── kits/<slug>.md
├── calendar/<dato>-<id>.md
└── shotlists/
    ├── <slug>-<id>.md
    └── <id>/
        ├── storyboard/   # shot-bilder
        └── moodboard/    # referansebilder
```

App-konfigurasjon lagres i Electron's `userData`-mappe som `slate-config.json` — ikke i vaulten.

## Migrering fra Markr

1. Gå til **Innstillinger** → **Importer fra Markr**
2. Velg én eller flere `.swshot`-filer
3. Knytt importerte shotlister til eksisterende prosjekter (valgfritt)

---

*Bygget av Stephan Teig — 2026*
