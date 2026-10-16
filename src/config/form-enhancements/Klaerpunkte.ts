// Auto-generated. Per-entity form-enhancements config for "Klärpunkte".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", "anfrage", "geschaeftsbereich", "art", {"row": ["status", "prioritaet"], "cols": "1fr 1fr"}, {"row": ["bearbeiter_vorname", "bearbeiter_nachname"]}, {"row": ["frist", "klaerungsdatum"], "cols": "1fr 1fr"}, "auswirkung", "frage", "antwort"],
  defaults: {
    'status': { kind: 'lookup', key: 'offen', label: 'Offen' },
    'prioritaet': { kind: 'lookup', key: 'normal', label: 'Normal' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
