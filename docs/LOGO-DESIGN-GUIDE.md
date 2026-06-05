# Slate — Logo Design Guide
> A step-by-step guide to designing the Slate app icon using Claude.
> Written specifically for this project — copy the prompts directly.

---

## Before You Start — Know What Slate Already Looks Like

The app has an established visual identity. Any logo must be coherent with it:

| Element | Detail |
|---|---|
| **Header stripe** | Diagonal clapper board bars (`-45deg`, equal spacing) in `--color-border` at 45% opacity |
| **Stat card labels** | `PROD / SHOOT / SHOT / EQ` — monospace, uppercase, tiny — referencing physical slate fields |
| **6 themes** | Nordic Slate (dark teal), Soft Dusk (dark purple), Tokyo Night (dark blue), Paper & Ink (light cream), Lavender Fog (light purple), Iron Press (light red/grey) |
| **Primary dark accent** | `#89c4cf` (Nordic Slate teal) — the default theme users land on |
| **Font** | Geist — geometric, clean, æøå-support |
| **App name** | Slate — named after the film slate (clapperboard) used on set |

The logo must feel like it belongs to a tool a professional filmmaker uses — precise, minimal, confident.

---

## Step 1 — Brand Brief (Pre-Written for You)

Use this as the foundation prompt in **any** Claude surface. Copy it verbatim.

```
I'm building an app called Slate — a cross-platform desktop app (Electron)
for video production management. It's used by independent filmmakers,
videographers, and content creators to manage projects, equipment, shoot
days, and shotlists. All data is stored as Markdown in an Obsidian vault.

The app is named after the film slate (clapperboard) used on set.
This is already reflected in the UI: the app header has a diagonal
clapper board stripe pattern, and stat cards use field labels like
PROD / SHOOT / SHOT / EQ — the same fields printed on a physical slate.

Brand personality: precise, cinematic, focused.
Target audience: professional and semi-professional filmmakers (solo operators
and small crews). They value tools that feel as intentional as their craft.

Primary color reference: #89c4cf (muted teal — from the "Nordic Slate" theme).
The full palette has 6 themes from deep dark to warm light, but Nordic Slate
is the default.

Typography: Geist (geometric, modern — same font as Vercel).

I need an app icon for macOS and Windows. It must:
- Be recognizable at 16×16 px (small) and beautiful at 1024×1024 (large)
- Reference the clapperboard without being a generic "clapperboard emoji"
- Work on both dark and light backgrounds
- Feel at home next to apps like Linear, Notion, Bear, and Final Cut Pro
```

---

## Step 2 — Choose Your Claude Surface

### Option A — Claude.ai Chat (Pro / Free)
**Best for:** Generating SVG code you can paste directly into the project.

**What to do:**
1. Go to [claude.ai](https://claude.ai) and start a new conversation
2. Paste the brand brief above
3. Then send this generation prompt:

```
Based on this brand brief, generate 3 logo concepts for Slate as SVG Artifacts.

Constraints:
- Canvas: 1024×1024px, transparent background
- Style: minimal, geometric, single-color or two-color maximum
- Must reference the clapperboard (diagonal stripes, the clapper arm, the slate frame)
  without looking like clip art
- Concept 1: Abstract — diagonal stripe motif (like the header stripe) formed into a mark
- Concept 2: Letterform — the letter "S" constructed from clapperboard geometry
- Concept 3: Icon — a minimal clapperboard reduced to its most essential shape (2-3 strokes)

Use #89c4cf as the primary color on a dark background (#1e2327) for one version,
and #1e2327 on transparent for the monochrome version.

Output each as a separate SVG Artifact.
```

4. Iterate on whichever concept you like most — see Step 4.

---

### Option B — Claude Design (Pro / Max / Team / Enterprise)
**Best for:** Visual iteration with a canvas, can export directly.

**What to do:**
1. Open Claude Design from your Claude Pro/Max dashboard
2. Upload a screenshot of the Slate app (use one from `assets/screenshots/home.png` in this repo)
3. Paste the brand brief, then add:

```
I'm uploading a screenshot of the app. Extract the visual language:
the diagonal stripe pattern in the header, the muted teal accent color,
the monospace field labels, and the dark surface colors.

Now design a logo icon that feels like a natural extension of this visual system.
The icon should look like it was designed alongside the app, not after it.

Generate 3 variations on the design canvas:
1. Full color (teal on dark)
2. Monochrome (dark on transparent — for light backgrounds)
3. Reversed (light on transparent — for dark backgrounds / macOS dock dark mode)

Final output should be 1024×1024px SVG.
```

5. Export from the Design canvas → download as SVG
6. Bring the SVG to Claude Code (this terminal) to finalize and convert to `.icns`/`.ico`

---

### Option C — Claude Code (This Terminal)
**Best for:** Implementing the final logo directly into the project as working icon files.

**Once you have an SVG concept you like (from Chat or Design):**

Paste the SVG code here and say:

```
Here is the Slate logo SVG. Please:
1. Save it to assets/icons/icon.svg
2. Validate that it renders correctly at 16×16, 32×32, 512×512, and 1024×1024
3. Generate a high-contrast monochrome version (dark on transparent) for light backgrounds
4. Note what additional steps are needed to convert to .icns (macOS) and .ico (Windows)
   using sharp or electron-icon-builder
```

Claude Code can also generate the SVG from scratch if you describe what you liked from the Chat/Design concepts.

---

### Option D — Claude Cowork
**Best for:** If you want to share the design session with a collaborator or review together.

Start a Cowork session, paste the brand brief and screenshots, and work through the concepts together in real time. The output is the same as Chat — SVG Artifacts you can bring into Code.

---

## Step 3 — Iteration Prompts (Copy These)

Use these specific follow-up prompts instead of vague feedback:

**If the stripes look too busy:**
```
The diagonal stripes are too dense — reduce the stripe count to 3 stripes maximum
inside the icon boundary. Keep the -45 degree angle and equal line/gap width.
```

**If it doesn't read at small sizes:**
```
This won't be legible at 16×16px. Simplify to a single bold shape or 2-3 thick strokes.
Remove any detail that's thinner than 60px at 1024×1024 scale.
```

**If the clapperboard reference is too literal:**
```
It looks too much like a clip art clapperboard. Remove the hinge, the arm, and the
teeth. Keep only the geometric language: diagonal stripes + rectangular frame.
Think Stripe's logo or Linear's icon — recognizable but abstract.
```

**If the color feels off:**
```
The teal (#89c4cf) feels too bright for a professional tool. Desaturate it by 15%
and reduce lightness by 10%. The icon should feel like it belongs next to Final Cut Pro,
not a productivity app.
```

**To get a rounded-corner version (for macOS):**
```
Generate a version with a rounded square background (corner radius = 22.5% of width,
matching Apple's icon grid). The icon should be centered at 80% of canvas size
(820×820 inner area) with 10% margin on all sides. This follows Apple's HIG icon grid.
```

---

## Step 4 — Export Requirements

When the design is final, get Claude to produce these files. Paste this prompt:

```
The logo is final. Please produce:

1. icon.svg — 1024×1024, transparent background, single clean path
2. icon-dark.svg — same but inverted (for light backgrounds)
3. icon-rounded.svg — same with Apple rounded-square container (#1e2327 background,
   corner radius 230px on 1024×1024)

Then tell me exactly what command to run with `electron-builder` or `sharp` to generate:
- icon.icns (macOS — requires 1024×1024 PNG source)
- icon.ico (Windows — requires 256×256 PNG source)
- icon.png (512×512 — used by electron-builder cross-platform)

Save all SVGs to assets/icons/ in the Slate project.
```

---

## Step 5 — After the Logo: Get a Design Manual

Once the logo is approved, run the same Claude session (don't start a new one — it has all the context) and send this:

```
The logo is now final. You have full context on:
- The Slate brand (cinematic, precise, focused)
- The existing UI visual system (6 themes, diagonal stripe header, Geist font,
  PROD/SHOOT/SHOT/EQ monospace labels, CSS custom properties)
- The logo we just designed

Now create a comprehensive Design Manual for Slate as a Markdown document.
Structure it as follows:

1. Brand Overview (purpose, personality, voice)
2. Logo Usage (safe zones, minimum sizes, dos and don'ts)
3. Color System (all 6 themes with hex values, when to use each, accessibility notes)
4. Typography (Geist scale, weights, usage rules — headings, body, monospace)
5. Iconography (stroke weight, grid, style guide for UI icons)
6. UI Patterns (the stripe motif, card field labels, surface hierarchy)
7. Motion & Interaction (transition timing, principles)
8. Platform Notes (macOS vs Windows differences, dark/light mode behavior)

Reference the existing CSS custom properties (--color-bg, --color-surface, etc.)
and the theme files. The manual should be detailed enough that a new designer
could implement a new screen without seeing the existing app.

Save it as docs/DESIGN-MANUAL.md in the project.
```

This prompt works best in Claude Code (this terminal) since it has direct access to all the theme files, component code, and CSS variables. Claude Code can read the actual source and write the manual based on what is already built — not guesswork.

---

## Quick Reference — Which Tool for What

| Task | Best Tool |
|---|---|
| Brainstorm concepts and get SVG code | Claude.ai Chat |
| Visual iteration with canvas and export | Claude Design |
| Implement SVG into project, generate icon files | Claude Code |
| Design manual from existing codebase | Claude Code |
| Collaborative review session | Claude Cowork |

---

## Files to Update After Logo Is Done

Once you have final icon files, bring them to Claude Code and ask it to:

```
I have the final icon files. Please:
1. Replace assets/icons/icon.png with the new 512×512 PNG
2. Update electron-builder config in package.json to point to the new icon paths
3. Commit with message "feat: update app icon to final logo"
```

---

*Guide written for Slate v1.0.0 — June 2026*
