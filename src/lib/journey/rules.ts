/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { policyLabel } from './policy';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'geschaeftsbereiche' | 'angebotsanfragen' | 'klaerpunkte';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "geschaeftsbereiche": "bezeichnung" | "kuerzel" | "zustaendigkeit" | "ansprechpartner_vorname" | "ansprechpartner_nachname" | "ansprechpartner_email" | "ansprechpartner_telefon";
  "angebotsanfragen": "anfragenummer" | "projekt" | "kunde_firma" | "kunde_vorname" | "kunde_nachname" | "beschreibung" | "vertrieb_vorname" | "vertrieb_nachname" | "bemerkungen";
  "klaerpunkte": "titel" | "frage" | "bearbeiter_vorname" | "bearbeiter_nachname" | "antwort";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "geschaeftsbereiche": never;
  "angebotsanfragen": "federfuehrender_bereich";
  "klaerpunkte": "anfrage" | "geschaeftsbereich";
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it (`file` is upload-only, never via a journey). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "geschaeftsbereiche": {
    "key": "geschaeftsbereiche",
    "appId": "6ad1d97cb027ce424a9af825",
    "label": "Geschäftsbereiche",
    "pascal": "Geschaeftsbereiche",
    "single": "GeschaeftsbereicheEntry"
  },
  "angebotsanfragen": {
    "key": "angebotsanfragen",
    "appId": "6ad1d97ff01694f8d7792c91",
    "label": "Angebotsanfragen",
    "pascal": "Angebotsanfragen",
    "single": "AngebotsanfragenEntry"
  },
  "klaerpunkte": {
    "key": "klaerpunkte",
    "appId": "6ad1d97f3212ab7dc3f1f9f9",
    "label": "Klärpunkte",
    "pascal": "Klaerpunkte",
    "single": "KlaerpunkteEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "geschaeftsbereiche": {
    "bezeichnung": {
      "key": "bezeichnung",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Bezeichnung",
      "writable": true,
      "maxLength": 4000
    },
    "kuerzel": {
      "key": "kuerzel",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Kürzel",
      "writable": true,
      "maxLength": 4000
    },
    "zustaendigkeit": {
      "key": "zustaendigkeit",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Zuständigkeit",
      "writable": true
    },
    "ansprechpartner_vorname": {
      "key": "ansprechpartner_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Vorname der Ansprechperson",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "ansprechpartner_nachname": {
      "key": "ansprechpartner_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Nachname der Ansprechperson",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "ansprechpartner_email": {
      "key": "ansprechpartner_email",
      "fulltype": "string/email",
      "kind": "email",
      "required": false,
      "label": "E-Mail der Ansprechperson",
      "writable": true,
      "autoComplete": "email"
    },
    "ansprechpartner_telefon": {
      "key": "ansprechpartner_telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": false,
      "label": "Telefon der Ansprechperson",
      "writable": true,
      "autoComplete": "tel"
    },
    "aktiv": {
      "key": "aktiv",
      "fulltype": "bool",
      "kind": "bool",
      "required": false,
      "label": "Bereich ist aktiv",
      "writable": true
    }
  },
  "angebotsanfragen": {
    "anfragenummer": {
      "key": "anfragenummer",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Anfragenummer",
      "writable": true,
      "maxLength": 4000
    },
    "projekt": {
      "key": "projekt",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Projekt- bzw. Produktbezeichnung",
      "writable": true,
      "maxLength": 4000
    },
    "eingangsdatum": {
      "key": "eingangsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Eingangsdatum",
      "writable": true
    },
    "angebotstermin": {
      "key": "angebotstermin",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Gewünschter Angebotstermin",
      "writable": true
    },
    "volumen": {
      "key": "volumen",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Geschätztes Volumen in Euro",
      "writable": true,
      "format": "currency"
    },
    "kunde_firma": {
      "key": "kunde_firma",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Kunde (Firma)",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "organization"
    },
    "kunde_vorname": {
      "key": "kunde_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Vorname Ansprechperson beim Kunden",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "kunde_nachname": {
      "key": "kunde_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Nachname Ansprechperson beim Kunden",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung der Anfrage",
      "writable": true
    },
    "gesamtstatus": {
      "key": "gesamtstatus",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Gesamtstatus",
      "writable": true,
      "options": [
        "neu",
        "in_klaerung",
        "bereit_angebot",
        "angebot_erstellt",
        "abgelehnt"
      ]
    },
    "prioritaet": {
      "key": "prioritaet",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Priorität",
      "writable": true,
      "options": [
        "niedrig",
        "normal",
        "hoch",
        "dringend"
      ]
    },
    "federfuehrender_bereich": {
      "key": "federfuehrender_bereich",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Federführender Bereich",
      "writable": true,
      "targetAppId": "6ad1d97cb027ce424a9af825",
      "targetEntity": "geschaeftsbereiche"
    },
    "vertrieb_vorname": {
      "key": "vertrieb_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Vorname Vertriebsverantwortliche/r",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "vertrieb_nachname": {
      "key": "vertrieb_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Nachname Vertriebsverantwortliche/r",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "bemerkungen": {
      "key": "bemerkungen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Interne Bemerkungen",
      "writable": true
    }
  },
  "klaerpunkte": {
    "anfrage": {
      "key": "anfrage",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Angebotsanfrage",
      "writable": true,
      "targetAppId": "6ad1d97ff01694f8d7792c91",
      "targetEntity": "angebotsanfragen"
    },
    "geschaeftsbereich": {
      "key": "geschaeftsbereich",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Zuständiger Geschäftsbereich",
      "writable": true,
      "targetAppId": "6ad1d97cb027ce424a9af825",
      "targetEntity": "geschaeftsbereiche"
    },
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "frage": {
      "key": "frage",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung der Frage",
      "writable": true
    },
    "art": {
      "key": "art",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Art der Klärung",
      "writable": true,
      "options": [
        "technisch",
        "kommerziell",
        "termin",
        "qualitaet",
        "logistik",
        "rechtliches",
        "sonstiges"
      ]
    },
    "prioritaet": {
      "key": "prioritaet",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Priorität",
      "writable": true,
      "options": [
        "niedrig",
        "normal",
        "hoch",
        "dringend"
      ]
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "offen",
        "in_bearbeitung",
        "rueckfrage_kunde",
        "geklaert",
        "nicht_relevant"
      ]
    },
    "frist": {
      "key": "frist",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Frist",
      "writable": true
    },
    "bearbeiter_vorname": {
      "key": "bearbeiter_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Vorname Bearbeiter/in",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "bearbeiter_nachname": {
      "key": "bearbeiter_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Nachname Bearbeiter/in",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "antwort": {
      "key": "antwort",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Antwort bzw. Ergebnis",
      "writable": true
    },
    "auswirkung": {
      "key": "auswirkung",
      "fulltype": "multiplelookup/checkbox",
      "kind": "multilookup",
      "required": false,
      "label": "Auswirkung auf das Angebot",
      "writable": true,
      "options": [
        "keine",
        "preis",
        "termin",
        "technik",
        "ausschluss"
      ]
    },
    "klaerungsdatum": {
      "key": "klaerungsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Datum der Klärung",
      "writable": true
    },
    "dokumentation": {
      "key": "dokumentation",
      "fulltype": "file",
      "kind": "file",
      "required": false,
      "label": "Dokumentation",
      "writable": false
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "geschaeftsbereiche": [],
  "angebotsanfragen": [
    {
      "kind": "choice",
      "field": "gesamtstatus",
      "count": 5
    },
    {
      "kind": "choice",
      "field": "prioritaet",
      "count": 4
    },
    {
      "kind": "record",
      "field": "federfuehrender_bereich",
      "targetEntity": "geschaeftsbereiche"
    }
  ],
  "klaerpunkte": [
    {
      "kind": "choice",
      "field": "prioritaet",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 5
    },
    {
      "kind": "record",
      "field": "anfrage",
      "targetEntity": "angebotsanfragen"
    },
    {
      "kind": "record",
      "field": "geschaeftsbereich",
      "targetEntity": "geschaeftsbereiche"
    }
  ]
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "geschaeftsbereiche": [
    "bezeichnung"
  ],
  "angebotsanfragen": [
    "anfragenummer"
  ],
  "klaerpunkte": [
    "titel"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
function displayPart(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — the owner's policy label first (a
 *  public page's "Felder anpassen"), runtime bundle second, generated label last. */
export function labelOf(entity: EntityKey, key: string): string {
  const own = policyLabel(entity, key);
  if (own) return own;
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
