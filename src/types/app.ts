import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Geschaeftsbereiche {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    bezeichnung?: string;
    kuerzel?: string;
    zustaendigkeit?: string;
    ansprechpartner_vorname?: string;
    ansprechpartner_nachname?: string;
    ansprechpartner_email?: string;
    ansprechpartner_telefon?: string;
    aktiv?: boolean;
  };
}

export interface Angebotsanfragen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    anfragenummer?: string;
    projekt?: string;
    eingangsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    angebotstermin?: string; // Format: YYYY-MM-DD oder ISO String
    volumen?: number;
    kunde_firma?: string;
    kunde_vorname?: string;
    kunde_nachname?: string;
    beschreibung?: string;
    gesamtstatus?: LookupValue;
    prioritaet?: LookupValue;
    federfuehrender_bereich?: RecordUrl; // applookup -> URL zu 'Geschaeftsbereiche' Record
    vertrieb_vorname?: string;
    vertrieb_nachname?: string;
    bemerkungen?: string;
  };
}

export interface Klaerpunkte {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    anfrage?: RecordUrl; // applookup -> URL zu 'Angebotsanfragen' Record
    geschaeftsbereich?: RecordUrl; // applookup -> URL zu 'Geschaeftsbereiche' Record
    titel?: string;
    frage?: string;
    art?: LookupValue;
    prioritaet?: LookupValue;
    status?: LookupValue;
    frist?: string; // Format: YYYY-MM-DD oder ISO String
    bearbeiter_vorname?: string;
    bearbeiter_nachname?: string;
    antwort?: string;
    auswirkung?: LookupValue[];
    klaerungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
  };
}

export const APP_IDS = {
  GESCHAEFTSBEREICHE: '6ad1d97cb027ce424a9af825',
  ANGEBOTSANFRAGEN: '6ad1d97ff01694f8d7792c91',
  KLAERPUNKTE: '6ad1d97f3212ab7dc3f1f9f9',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'angebotsanfragen': {
    gesamtstatus: [{ key: "neu", get label() { return lookupLabel('angebotsanfragen', 'gesamtstatus', "neu") ?? "Neu"; } }, { key: "in_klaerung", get label() { return lookupLabel('angebotsanfragen', 'gesamtstatus', "in_klaerung") ?? "In Klärung"; } }, { key: "bereit_angebot", get label() { return lookupLabel('angebotsanfragen', 'gesamtstatus', "bereit_angebot") ?? "Bereit zur Angebotserstellung"; } }, { key: "angebot_erstellt", get label() { return lookupLabel('angebotsanfragen', 'gesamtstatus', "angebot_erstellt") ?? "Angebot erstellt"; } }, { key: "abgelehnt", get label() { return lookupLabel('angebotsanfragen', 'gesamtstatus', "abgelehnt") ?? "Abgelehnt"; } }],
    prioritaet: [{ key: "niedrig", get label() { return lookupLabel('angebotsanfragen', 'prioritaet', "niedrig") ?? "Niedrig"; } }, { key: "normal", get label() { return lookupLabel('angebotsanfragen', 'prioritaet', "normal") ?? "Normal"; } }, { key: "hoch", get label() { return lookupLabel('angebotsanfragen', 'prioritaet', "hoch") ?? "Hoch"; } }, { key: "dringend", get label() { return lookupLabel('angebotsanfragen', 'prioritaet', "dringend") ?? "Dringend"; } }],
  },
  'klaerpunkte': {
    art: [{ key: "technisch", get label() { return lookupLabel('klaerpunkte', 'art', "technisch") ?? "Technisch"; } }, { key: "kommerziell", get label() { return lookupLabel('klaerpunkte', 'art', "kommerziell") ?? "Kommerziell"; } }, { key: "termin", get label() { return lookupLabel('klaerpunkte', 'art', "termin") ?? "Termin"; } }, { key: "qualitaet", get label() { return lookupLabel('klaerpunkte', 'art', "qualitaet") ?? "Qualität"; } }, { key: "logistik", get label() { return lookupLabel('klaerpunkte', 'art', "logistik") ?? "Logistik"; } }, { key: "rechtliches", get label() { return lookupLabel('klaerpunkte', 'art', "rechtliches") ?? "Rechtliches"; } }, { key: "sonstiges", get label() { return lookupLabel('klaerpunkte', 'art', "sonstiges") ?? "Sonstiges"; } }],
    prioritaet: [{ key: "niedrig", get label() { return lookupLabel('klaerpunkte', 'prioritaet', "niedrig") ?? "Niedrig"; } }, { key: "normal", get label() { return lookupLabel('klaerpunkte', 'prioritaet', "normal") ?? "Normal"; } }, { key: "hoch", get label() { return lookupLabel('klaerpunkte', 'prioritaet', "hoch") ?? "Hoch"; } }, { key: "dringend", get label() { return lookupLabel('klaerpunkte', 'prioritaet', "dringend") ?? "Dringend"; } }],
    status: [{ key: "rueckfrage_kunde", get label() { return lookupLabel('klaerpunkte', 'status', "rueckfrage_kunde") ?? "Rückfrage an Kunde"; } }, { key: "geklaert", get label() { return lookupLabel('klaerpunkte', 'status', "geklaert") ?? "Geklärt"; } }, { key: "offen", get label() { return lookupLabel('klaerpunkte', 'status', "offen") ?? "Offen"; } }, { key: "nicht_relevant", get label() { return lookupLabel('klaerpunkte', 'status', "nicht_relevant") ?? "Nicht relevant"; } }, { key: "in_bearbeitung", get label() { return lookupLabel('klaerpunkte', 'status', "in_bearbeitung") ?? "In Bearbeitung"; } }],
    auswirkung: [{ key: "preis", get label() { return lookupLabel('klaerpunkte', 'auswirkung', "preis") ?? "Preis"; } }, { key: "termin", get label() { return lookupLabel('klaerpunkte', 'auswirkung', "termin") ?? "Termin"; } }, { key: "technik", get label() { return lookupLabel('klaerpunkte', 'auswirkung', "technik") ?? "Technik"; } }, { key: "ausschluss", get label() { return lookupLabel('klaerpunkte', 'auswirkung', "ausschluss") ?? "Ausschluss"; } }, { key: "keine", get label() { return lookupLabel('klaerpunkte', 'auswirkung', "keine") ?? "Keine"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'geschaeftsbereiche': {
    'bezeichnung': 'string/text',
    'kuerzel': 'string/text',
    'zustaendigkeit': 'string/textarea',
    'ansprechpartner_vorname': 'string/text',
    'ansprechpartner_nachname': 'string/text',
    'ansprechpartner_email': 'string/email',
    'ansprechpartner_telefon': 'string/tel',
    'aktiv': 'bool',
  },
  'angebotsanfragen': {
    'anfragenummer': 'string/text',
    'projekt': 'string/text',
    'eingangsdatum': 'date/date',
    'angebotstermin': 'date/date',
    'volumen': 'number',
    'kunde_firma': 'string/text',
    'kunde_vorname': 'string/text',
    'kunde_nachname': 'string/text',
    'beschreibung': 'string/textarea',
    'gesamtstatus': 'lookup/select',
    'prioritaet': 'lookup/radio',
    'federfuehrender_bereich': 'applookup/select',
    'vertrieb_vorname': 'string/text',
    'vertrieb_nachname': 'string/text',
    'bemerkungen': 'string/textarea',
  },
  'klaerpunkte': {
    'anfrage': 'applookup/select',
    'geschaeftsbereich': 'applookup/select',
    'titel': 'string/text',
    'frage': 'string/textarea',
    'art': 'lookup/select',
    'prioritaet': 'lookup/radio',
    'status': 'lookup/select',
    'frist': 'date/date',
    'bearbeiter_vorname': 'string/text',
    'bearbeiter_nachname': 'string/text',
    'antwort': 'string/textarea',
    'auswirkung': 'multiplelookup/checkbox',
    'klaerungsdatum': 'date/date',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateGeschaeftsbereiche = StripLookup<Geschaeftsbereiche['fields']>;
export type CreateAngebotsanfragen = StripLookup<Angebotsanfragen['fields']>;
export type CreateKlaerpunkte = StripLookup<Klaerpunkte['fields']>;