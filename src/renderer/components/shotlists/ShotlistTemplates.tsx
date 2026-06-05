import React from 'react'
import type { ShotSection, ShotRowType } from '../../../shared/types/shotlist'
import { SECTION_COLORS } from '../../../shared/constants'

interface TemplateRow { type: ShotRowType; text: string }
interface TemplateDef { name: string; sections: { name: string; rows: TemplateRow[] }[] }

const TEMPLATES: TemplateDef[] = [
  {
    name: 'Boligfoto',
    sections: [
      { name: 'Eksteriør', rows: [{ type: 'shot', text: 'Fasade fra gaten' }, { type: 'shot', text: 'Innkjørsel og parkering' }, { type: 'note', text: 'Gyllen time anbefales' }] },
      { name: 'Stue', rows: [{ type: 'shot', text: 'Wide rom' }, { type: 'shot', text: 'Detalj sofa og puter' }, { type: 'shot', text: 'Mot vindu med lys' }] },
      { name: 'Kjøkken', rows: [{ type: 'shot', text: 'Wide kjøkken' }, { type: 'shot', text: 'Benkeplate nært' }, { type: 'shot', text: 'Detalj armatur' }] },
      { name: 'Soverom', rows: [{ type: 'shot', text: 'Wide soverom' }, { type: 'shot', text: 'Sengegavl detalj' }] },
      { name: 'Bad', rows: [{ type: 'shot', text: 'Wide bad' }, { type: 'shot', text: 'Detalj armatur og fliser' }] },
    ],
  },
  {
    name: 'Intervju',
    sections: [
      { name: 'Oppsett', rows: [{ type: 'note', text: 'Sjekk lys og lydforhold' }, { type: 'shot', text: 'Testshot med intervjuobjekt' }] },
      { name: 'Intervju', rows: [{ type: 'shot', text: 'Wide 2-shot' }, { type: 'shot', text: 'Nært ansikt intervjuobjekt' }, { type: 'shot', text: 'Over-shoulder' }] },
      { name: 'B-roll', rows: [{ type: 'shot', text: 'Hender i bevegelse' }, { type: 'shot', text: 'Miljø og kontekst' }, { type: 'note', text: 'Minst 5 min b-roll' }] },
    ],
  },
  {
    name: 'Social Media',
    sections: [
      { name: 'Hook', rows: [{ type: 'shot', text: 'Åpningsshot 3 sek' }, { type: 'note', text: 'Tekst on screen?' }] },
      { name: 'Body', rows: [{ type: 'shot', text: 'Hoveddel 1' }, { type: 'shot', text: 'Hoveddel 2' }, { type: 'quote', text: 'Hovudbudskap her' }] },
      { name: 'CTA', rows: [{ type: 'shot', text: 'Call to action avslutning' }] },
    ],
  },
  {
    name: 'Event',
    sections: [
      { name: 'Ankomst', rows: [{ type: 'shot', text: 'Folk ankommer' }, { type: 'shot', text: 'Skilt og branding' }] },
      { name: 'Program', rows: [{ type: 'shot', text: 'Sceneshot wide' }, { type: 'shot', text: 'Nært taler/artist' }, { type: 'shot', text: 'Publikumsreaksjon' }] },
      { name: 'Detaljer', rows: [{ type: 'shot', text: 'Mat og drikke detalj' }, { type: 'shot', text: 'Dekorasjoner' }] },
      { name: 'Avslutning', rows: [{ type: 'shot', text: 'Folkemengde' }, { type: 'note', text: 'Få spontane reaksjoner på kamera' }] },
    ],
  },
  {
    name: 'Produktfoto',
    sections: [
      { name: 'Produkt alene', rows: [{ type: 'shot', text: 'Front wide' }, { type: 'shot', text: '3/4-vinkel' }, { type: 'shot', text: 'Detalj 1' }, { type: 'shot', text: 'Detalj 2' }] },
      { name: 'I bruk', rows: [{ type: 'shot', text: 'Hands-on shot' }, { type: 'shot', text: 'Livsstil-kontekst' }] },
      { name: 'Emballasje', rows: [{ type: 'shot', text: 'Pakke lukket' }, { type: 'shot', text: 'Pakke åpen' }, { type: 'note', text: 'Hvit/nøytral bakgrunn' }] },
    ],
  },
  {
    name: 'Podcast Video',
    sections: [
      { name: 'Intro', rows: [{ type: 'shot', text: 'Wide 2-shot begge gjester' }, { type: 'shot', text: 'Host nært' }, { type: 'shot', text: 'Gjest nært' }] },
      { name: 'Samtale', rows: [{ type: 'shot', text: 'Over-shoulder host' }, { type: 'shot', text: 'Over-shoulder gjest' }, { type: 'shot', text: 'Reaksjonsshot' }] },
      { name: 'Avslutning', rows: [{ type: 'shot', text: 'Wide 2-shot' }, { type: 'note', text: 'Husk outro-grafikk i post' }] },
    ],
  },
  {
    name: 'Testimonial',
    sections: [
      { name: 'Oppsett', rows: [{ type: 'note', text: 'Naturlig bakgrunn foretrekkes' }, { type: 'shot', text: 'Testshot og juster lys' }] },
      { name: 'Testimonial', rows: [{ type: 'shot', text: 'Nært ansikt' }, { type: 'shot', text: '3/4-profil' }, { type: 'quote', text: 'Hovednøkkelsetning fra klienten' }] },
      { name: 'B-roll', rows: [{ type: 'shot', text: 'Person i naturlig kontekst' }, { type: 'shot', text: 'Produkt/tjeneste i bruk' }] },
    ],
  },
  {
    name: 'Behind the Scenes',
    sections: [
      { name: 'Rigging', rows: [{ type: 'shot', text: 'Team setter opp utstyr' }, { type: 'shot', text: 'Kamera og lys detaljer' }] },
      { name: 'Under shoot', rows: [{ type: 'shot', text: 'Fotograf/regissør bak kamera' }, { type: 'shot', text: 'Monitor med bilde' }, { type: 'shot', text: 'Team-dynamikk' }] },
      { name: 'Pauser', rows: [{ type: 'shot', text: 'Uformelle øyeblikk' }, { type: 'note', text: 'Autentisitet er viktigere enn perfeksjon' }] },
    ],
  },
  {
    name: 'Brand Film',
    sections: [
      { name: 'Åpning', rows: [{ type: 'shot', text: 'Sterk visuell teaser' }, { type: 'note', text: 'Skal stoppe scrollingen' }] },
      { name: 'Produkt/tjeneste', rows: [{ type: 'shot', text: 'Hero shot' }, { type: 'shot', text: 'I bruk' }, { type: 'shot', text: 'Detaljer' }] },
      { name: 'Menneskene', rows: [{ type: 'shot', text: 'Ansatte eller grunnlegger' }, { type: 'quote', text: 'Visjon og verdier' }] },
      { name: 'Avslutning', rows: [{ type: 'shot', text: 'Logo/branding shot' }, { type: 'shot', text: 'Call to action' }] },
    ],
  },
]

function buildSections(template: TemplateDef): ShotSection[] {
  return template.sections.map((s, i) => ({
    id: crypto.randomUUID(),
    name: s.name,
    color: SECTION_COLORS[i % SECTION_COLORS.length],
    collapsed: false,
    rows: s.rows.map((r) => ({
      id: crypto.randomUUID(),
      type: r.type,
      text: r.text,
      checked: false,
    })),
  }))
}

interface Props {
  onApply: (sections: ShotSection[]) => void
  onClose: () => void
  hasExistingSections: boolean
}

export function ShotlistTemplates({ onApply, onClose, hasExistingSections }: Props) {
  const [confirmTemplate, setConfirmTemplate] = React.useState<TemplateDef | null>(null)

  function handleSelect(template: TemplateDef) {
    if (hasExistingSections) {
      setConfirmTemplate(template)
    } else {
      onApply(buildSections(template))
      onClose()
    }
  }

  function countShots(template: TemplateDef) {
    return template.sections.flatMap((s) => s.rows).filter((r) => r.type === 'shot').length
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div
        className="rounded-xl border p-6 w-[560px] max-h-[80vh] overflow-y-auto"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Velg mal</h2>
          <button onClick={onClose} className="text-sm" style={{ color: 'var(--color-text-muted)' }}>✕</button>
        </div>

        {confirmTemplate ? (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--color-text)' }}>
              Vil du erstatte eksisterende scener med malen «{confirmTemplate.name}»?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { onApply(buildSections(confirmTemplate)); onClose() }}
                className="btn-primary text-sm flex-1"
              >
                Erstatt
              </button>
              <button onClick={() => setConfirmTemplate(null)} className="btn-secondary text-sm">Avbryt</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                onClick={() => handleSelect(tpl)}
                className="rounded-lg border p-3 text-left transition-colors hover:border-[var(--color-accent)]"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{tpl.name}</p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {tpl.sections.length} scener · {countShots(tpl)} shots
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
