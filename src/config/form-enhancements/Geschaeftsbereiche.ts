// Auto-generated. Per-entity form-enhancements config for "Geschäftsbereiche".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [{"row": ["bezeichnung", "kuerzel"], "cols": "2fr 1fr"}, {"row": ["ansprechpartner_vorname", "ansprechpartner_nachname"]}, "ansprechpartner_email", "ansprechpartner_telefon", "aktiv", "zustaendigkeit"],
  defaults: {
    'aktiv': { kind: 'literal', value: true },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
