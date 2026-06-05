# slate:create-content

Skill for å raskt opprette innhold i Slate-appen — kits, utstyr, shotlister, prosjekter og shoot-dager — enten som realistiske testdata eller ekte produksjonsinnhold.

## Triggere

Aktiver denne skillen når brukeren sier ting som:
- "lag et kit for intervjuopptak"
- "legg til kameraet mitt i utstyrslisten"
- "lag en shotlist for en produktvideo"
- "sett opp testdata i Slate"
- "opprett en shoot-dag for fredag"
- "fyll Slate med eksempel-innhold"
- "seed Slate"
- "lag innhold for shoot"
- "opprett en utstyrspakke"

---

## Datamodeller og Markdown-format

Alle filer lagres i Obsidian-vaulten under `<vault>/Slate/`. Korrekt YAML frontmatter er kritisk — parse-logikken i `markdownService.ts` er fasit.

### Slugify-regler (ALLTID bruk for filnavn)

```
1. Konverter til lowercase
2. æ → ae, ø → oe, å → aa
3. Erstatt ikke-alfanumeriske tegn med -
4. Fjern ledende/etterfølgende -
5. Maks 80 tegn

Eksempel: "Sony FX3 Kamera" → "sony-fx3-kamera"
         "Røde NTG-5 Mikrofon" → "roede-ntg-5-mikrofon"
```

### ID-format

Bruk `crypto.randomUUID()` eller generer et realistisk UUID v4. I eksempler nedenfor brukes beskrivende placeholder-IDer — erstatt alltid med ekte UUIDs i output.

---

## KIT

**Lagres:** `<vault>/Slate/kits/<slug>.md`

**Frontmatter-felt (fra `serializeKitFile`):**
- `id` — UUID
- `name` — visningsnavn
- `description` — valgfritt
- `shotType` — f.eks. "Intervju", "Run & Gun", "Boligfoto", "Produktfoto", "Event"
- `equipmentIds` — array av UUIDs (kan være tomme strings som placeholder)

**Body:** notater (valgfritt)

```markdown
---
id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
name: Interview Kit
description: Standard utstyr for intervjuopptak innendørs
shotType: Intervju
equipmentIds:
  - "b2c3d4e5-f6a7-8901-bcde-f12345678901"
  - "c3d4e5f6-a7b8-9012-cdef-123456789012"
  - "d4e5f6a7-b8c9-0123-defa-234567890123"
---

Anbefalt oppsett for intervjuer. Husk ekstra batterier til FX3.
```

**Vanlige kit-typer og realistisk utstyr:**

| Kit | shotType | Typisk utstyr |
|-----|----------|---------------|
| Interview Kit | Intervju | Kamera, stativ, nøkkellys, fylllys, Deity mikrofon, boom arm |
| Run & Gun Kit | Run & Gun | Kamera, håndholdt gimbal, on-camera mikrofon, ekstra batterier |
| Boligfoto Kit | Boligfoto | Kamera, vidvinkellinse, stativ, blits, diffuser |
| Produktfoto Kit | Produktfoto | Kamera, makrolinse, lightbox, hvit/grå bakgrunn, stativ |
| Event Kit | Event | Kamera, zoomlinse, lysforsterker, stativ, ekstra minnekort |
| Podcast Video Kit | Podcast Video | Kamera, stativ, ringlys/nøkkellys, bordmikrofon, akustikkpanel |

---

## EQUIPMENT

**Lagres:** `<vault>/Slate/equipment/<slug>.md`

**Frontmatter-felt (fra `serializeEquipmentFile`):**
- `id` — UUID
- `name` — visningsnavn
- `category` — "Kamera", "Lyd", "Lys", "Stativ", "Linse", "Tilbehør", "Gimbal", "Drone"
- `ownerId` — UUID som refererer til owner i slate-config.json
- `serialNumber` — valgfritt
- `purchasePrice` — valgfritt (number, NOK)
- `status` — alltid `available` med mindre brukeren sier noe annet
- `created` — ISO 8601 dato (ikke `createdAt` — bruk `created` i frontmatter)

**Body:** notater (valgfritt)

```markdown
---
id: "b2c3d4e5-f6a7-8901-bcde-f12345678901"
name: Sony FX3
category: Kamera
ownerId: "owner-uuid-her"
serialNumber: "ABC123"
purchasePrice: 45000
status: available
created: "2026-06-05"
---

Full-frame Cinema Line. Brukes primært til intervjuer og narrative produksjoner.
```

**Realistisk norsk videoproduksjonsutstyr:**

Kamera: Sony FX3, Sony A7 IV, Sony A7S III, Canon R6, Fujifilm X-T5, Blackmagic Pocket 6K
Lyd: Deity S-Mic 2, Rode NTG-5, Rode Wireless GO II, DJI Mic 2, Zoom H6, Sennheiser MKH 416
Lys: Aputure 300d II, Nanlite Forza 60B, Godox SL-150W, Aputure MC, Nanlite Pavotube 6C
Stativ: Manfrotto 504X, Sachtler Ace M, Benro Mach3, Joby GorillaPod 5K
Linse: Sony 24-70mm f/2.8 GM II, Sony 85mm f/1.4 GM, Sigma 35mm f/1.4 Art
Gimbal: DJI RS 3 Pro, Zhiyun Crane 4, FeiyuTech AK4500

---

## SHOTLIST

**Lagres:** `<vault>/Slate/shotlists/<id>.md` (filnavn = shotlist ID)

**Frontmatter-felt (fra `serializeShotlistFile`):**
- `id` — UUID
- `title` — visningsnavn
- `projectId` — valgfritt UUID
- `shootDayId` — valgfritt UUID
- `moodboardImages` — array (tom som default `[]`)
- `createdAt` — ISO 8601
- `updatedAt` — ISO 8601
- `sections` — array av ShotSection

**ShotSection-felt:**
- `id` — UUID
- `name` — seksjonsnavn
- `color` — hex fra paletten (sykler): `#4f8ef7` `#f7a24f` `#4fc18e` `#f74f4f` `#b44ff7` `#f7e24f`
- `collapsed` — alltid `false` i ny innhold
- `rows` — array av ShotRow

**ShotRow-felt:**
- `id` — UUID
- `type` — `shot`, `note` eller `quote`
- `text` — beskrivelse/innhold
- `checked` — alltid `false` i nytt innhold
- `shotSize` — kun for type=shot: `vidvinkel`, `medium`, `naert`, `ekstremt-naert`, `over-shoulder`, `insert`, `medium-naert`, `medium-vidvinkel`, `ekstrem-vidvinkel`
- `lens` — fritekst, f.eks. "24mm", "50mm"
- `movement` — `statisk`, `pan`, `tilt`, `dolly-inn`, `dolly-ut`, `haandholdt`, `steadicam`, `crane`, `zoom-inn`, `zoom-ut`, `rack-focus`

**NB:** `imagePath` og `extraNotes` utelates i nytt innhold (ingen storyboard-bilder ennå).

```markdown
---
id: "e5f6a7b8-c9d0-1234-efab-567890123456"
title: Produktvideo Q3 — Åpningsseksjon
projectId: "f6a7b8c9-d0e1-2345-fabc-678901234567"
createdAt: "2026-06-05"
updatedAt: "2026-06-05"
sections:
  - id: "a7b8c9d0-e1f2-3456-abcd-789012345678"
    name: Åpning
    color: '#4f8ef7'
    collapsed: false
    rows:
      - id: "b8c9d0e1-f2a3-4567-bcde-890123456789"
        type: shot
        text: WS produkt på minimalistisk bord, kamera sentrert
        checked: false
        shotSize: vidvinkel
        lens: 24mm
        movement: statisk
      - id: "c9d0e1f2-a3b4-5678-cdef-901234567890"
        type: note
        text: Husk å rydde bakgrunnen grundig — ingen distraksjoner
        checked: false
  - id: "d0e1f2a3-b4c5-6789-defa-012345678901"
    name: Detaljer
    color: '#f7a24f'
    collapsed: false
    rows:
      - id: "e1f2a3b4-c5d6-7890-efab-123456789012"
        type: shot
        text: ECU av produktlogo og overflatedetaljer
        checked: false
        shotSize: ekstremt-naert
        lens: 85mm
        movement: rack-focus
moodboardImages: []
---
```

---

## PROJECT

**Lagres (to filer):**
- `<vault>/Slate/projects/<slug>/project.md`
- `<vault>/Slate/projects/<slug>/tasks.md`

**project.md frontmatter (fra `serializeProjectFile`):**
- `id` — UUID
- `title` — visningsnavn
- `status` — `planning` eller `in-progress` (aldri `archived` via skill)
- `dropbox` — valgfri URL
- `created` — ISO 8601
- `updated` — ISO 8601
- `tags` — alltid `[slate, project]`

**tasks.md format:**
- Frontmatter: `projectId: <UUID>`
- Body: GFM task-liste (maks 2 nivåer innrykk)

```markdown
---
id: "f6a7b8c9-d0e1-2345-fabc-678901234567"
title: Produktkampanje Sommer 2026
status: in-progress
created: "2026-06-05"
updated: "2026-06-05"
tags:
  - slate
  - project
---
```

```markdown
---
projectId: "f6a7b8c9-d0e1-2345-fabc-678901234567"
---

- [ ] Pre-produksjon
  - [ ] Moodboard godkjent
  - [ ] Utstyr booket
- [ ] Shoot-dag
  - [ ] Oppsett og testing
  - [ ] Opptak gjennomført
- [ ] Post-produksjon
  - [ ] Råklipp til klient
  - [ ] Fargegrading
- [ ] Leveranse
  - [ ] Eksportert til Dropbox
```

**Regler:**
- Crew-felt finnes IKKE på prosjekter — kun på shoot-dager
- Prosjekter arkiveres aldri via skill (`status: archived` er forbudt her)

---

## SHOOT DAY

**Lagres:** `<vault>/Slate/calendar/<dato>-<id>.md`

Filnavnformat: `2026-06-15-<kortet-id>.md` (ISO-dato + bindestrek + første 8 tegn av ID)

**Frontmatter-felt (fra `serializeShootDayFile`):**
- `id` — UUID
- `date` — ISO 8601
- `title` — visningsnavn
- `projectId` — valgfritt UUID
- `location` — valgfritt
- `crew` — fritekst, f.eks. "Stephan, Kari, Ola"
- `equipmentIds` — valgfri array av UUIDs

**Body:** notater (valgfritt)

```markdown
---
id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
date: "2026-06-15"
title: Shoot — Produktkampanje Sommer 2026
projectId: "f6a7b8c9-d0e1-2345-fabc-678901234567"
location: "Aker Brygge, Oslo"
crew: "Stephan, Kari"
equipmentIds:
  - "b2c3d4e5-f6a7-8901-bcde-f12345678901"
  - "d4e5f6a7-b8c9-0123-defa-234567890123"
---

Møt opp kl 08:00. Parkering i Aker Brygge P-hus.
```

---

## Preset-pakker

### "Fullstendig testdata-pakke"

**Trigger:** "sett opp testdata", "fyll Slate med eksempler", "seed Slate", "generer demo-innhold"

Generer alltid alle disse filene med konsistente UUIDs (utstyr referert i kits og shoot-dager finnes faktisk i equipment-filene):

**Utstyr (8 items):**
- Sony FX3 (Kamera)
- Sony 24-70mm f/2.8 GM II (Linse)
- Deity S-Mic 2 (Lyd)
- Rode Wireless GO II (Lyd)
- Aputure 300d II (Lys)
- Nanlite Pavotube 6C (Lys)
- Manfrotto 504X (Stativ)
- DJI RS 3 Pro (Gimbal)

**Kits (3 stk):**
- Interview Kit (Sony FX3 + Deity S-Mic 2 + Aputure 300d II + Manfrotto 504X)
- Run & Gun Kit (Sony FX3 + DJI RS 3 Pro + Rode Wireless GO II)
- Lys-kit (Aputure 300d II + Nanlite Pavotube 6C)

**Prosjekter (2 stk):**
- "Produktkampanje Sommer 2026" — status: in-progress, 4 tasks
- "Bedriftsvideo TechCorp" — status: planning, 3 tasks

**Shoot-dager (2 stk):**
- Denne uken (beregn fra dagens dato)
- Neste uke

**Shotlister (2 stk):**
- Én per prosjekt, med 3 seksjoner og 4-5 shots + 1 note per seksjon

Generer **alle filene** med korrekt formatering. Inkluder et Node.js seed-script (`seed-slate.mjs`) som skriver alle filene til vaulten.

---

### "On-set pakke"

**Trigger:** "lag innhold for shoot", "sett opp for dagens shoot", "opprett shoot-dag"

**Spør om** (bruk AskUserQuestion):
1. Prosjektnavn (eller eksisterende prosjekt-ID)
2. Dato for shoot
3. Lokasjon
4. Crew (fritekst)

Generer:
- Én shoot-dag-fil
- Én tom shotlist koblet til shoot-dagen (med én starter-seksjon)

---

### "Kit-byggepakke"

**Trigger:** "lag et kit", "opprett utstyrspakke", "lag [type]-kit"

**Spør om** (hvis ikke allerede oppgitt):
1. Hva slags type shoot? (Intervju / Run & Gun / Boligfoto / Produktfoto / Event / Annet)
2. Hva skal kitet hete?

Generer korrekt kit-fil med realistisk utstyrsliste for den typen shoot. Inkluder kommentar om hvilke equipment-IDer brukeren må erstatte med sine egne.

---

## Seed-script format

Når brukeren vil seede data programmatisk, generer et Node.js-script:

```javascript
// seed-slate.mjs
// Kjør med: node seed-slate.mjs
// Sett SLATE_VAULT til din vault-root, f.eks:
//   SLATE_VAULT=/Users/stephan/Obsidian/MinVault node seed-slate.mjs

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

const VAULT = process.env.SLATE_VAULT
if (!VAULT) {
  console.error('Sett SLATE_VAULT-miljøvariabelen til vault-roten din.')
  process.exit(1)
}

const SLATE = join(VAULT, 'Slate')

// Opprett mappestruktur
const dirs = ['equipment', 'equipment/loans', 'kits', 'calendar', 'projects', 'shotlists']
dirs.forEach(d => mkdirSync(join(SLATE, d), { recursive: true }))

// [Generert innhold her — én writeFileSync per fil]

console.log('✓ Testdata lagt til i', SLATE)
```

---

## Arbeidsflyt

1. **Identifiser innholdstype** fra brukerens forespørsel
2. **Still avklarende spørsmål** hvis nødvendig (bruk `AskUserQuestion` for valg mellom alternativer, plain text for åpne spørsmål)
3. **Generer output** — alltid begge:
   - Ferdig Markdown-fil(er) med korrekt frontmatter
   - Instruksjoner for plassering i vaulten
4. **Tilby seed-script** hvis det er mer enn 2 filer (spør alltid om brukeren vil ha det)

### Output-format

For én fil — vis direkte i codeblock med filsti som header:

```
### `<vault>/Slate/kits/interview-kit.md`
```markdown
[innhold]
```
```

For preset-pakker — vis filtre som collapsible-liste med filsti + innhold for hver.

---

## Regler som ALDRI brytes

- Bruk alltid gyldige UUID v4 (ikke enkle tall eller sekvenser)
- Status på utstyr er alltid `available` med mindre brukeren eksplisitt sier noe annet
- Prosjekter arkiveres ALDRI via skill — kun `planning` eller `in-progress`
- `crew` er KUN på shoot-dager, ALDRI på prosjekter
- Alle datoer er ISO 8601: `"2026-06-05"` (med anførselstegn i YAML)
- All UI-tekst og innhold er på norsk
- Slugify filnavn korrekt
- `shotlist`-filnavn er shotlist-IDen (ikke slugified tittel)
- `created`-felt i equipment (ikke `createdAt`) — følg `serializeEquipmentFile`
- Farger i seksjoner er hex med single quotes i YAML: `color: '#4f8ef7'`
- `moodboardImages` er alltid `[]` i nytt innhold
- `collapsed` er alltid `false` i nye seksjoner
- `checked` er alltid `false` i nye rader
- UUIDs i utstyrslister i kits og shoot-dager MÅ referere til faktisk eksisterende utstyr (eller markeres tydelig som placeholder)
