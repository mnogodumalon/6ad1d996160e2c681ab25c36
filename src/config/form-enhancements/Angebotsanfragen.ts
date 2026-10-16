// Auto-generated. Per-entity form-enhancements config for "Angebotsanfragen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["anfragenummer", "projekt", "kunde_firma", "gesamtstatus", "prioritaet", {"row": ["eingangsdatum", "angebotstermin"], "cols": "1fr 1fr"}, "volumen", {"row": ["kunde_vorname", "kunde_nachname"]}, "federfuehrender_bereich", {"row": ["vertrieb_vorname", "vertrieb_nachname"]}, "beschreibung", "bemerkungen"],
  defaults: {
    'eingangsdatum': { kind: 'today' },
    'angebotstermin': { kind: 'todayOffset', days: 14 },
    'gesamtstatus': { kind: 'lookup', key: 'neu', label: 'Neu' },
    'prioritaet': { kind: 'lookup', key: 'normal', label: 'Normal' },
  },
  computed: {
    '_anfrage_dauer_tage': { kind: 'dateDiff', from: 'eingangsdatum', to: 'angebotstermin', unit: 'days' },
  },
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
