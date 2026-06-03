# Slate

Cross-platform produksjonsdashboard for videoskapere. Lagrer all data som Markdown-filer i en Obsidian-vault.

## Features

- **Prosjekt-todo** — hierarkiske tasks med sub-tasks, arkivering
- **Utstyrsregister** — katalog med eiere, utlånshåndtering, PDF-eksport
- **Utlånskalender** — visuell kalender med overlappvalidering og forfalt-varsler
- **Utstyrskits** — pakk utstyr i gjenbrukbare kits med tilgjengelighetsstatus
- **Shoot-kalender** — planlegg shoot-dager med utstyr og prosjekttilknytning
- **6 temaer** — live theme-switching uten reload
- **Dataportabilitet** — eksporter og importer alt som ZIP

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
npm run test:e2e    # E2E-tester (krever kjørende app)
```

## Tech stack

| Lag | Valg |
|-----|------|
| Framework | Electron 42 |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS 3 + CSS custom properties |
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
└── calendar/<dato>.md
```

App-konfigurasjon lagres i Electron's `userData`-mappe som `slate-config.json` — ikke i vaulten.

---

*Bygget av Stephan Teig — 2026*
