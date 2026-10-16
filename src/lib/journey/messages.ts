/**
 * Required-field messages — WRITTEN BY THE BUILD AGENT, never by a heuristic.
 *
 * The layer knows two things about an empty required field: that it is
 * required and what its label is. Out of that it can only say „„Anreise" ist
 * ein Pflichtfeld". What the person should do instead („Bitte einen Gast
 * auswählen.") is meaning, and meaning is the agent's: the Phase-2 orchestrator
 * writes one short instruction per required field — what is needed, not why — to
 * `.intents-staging/messages.json`, the integration step validates it against
 * the app metadata and renders it into the block below. Scaffold updates keep
 * the block. Do not edit outside the markers.
 *
 * Every door reads this and nothing else: `useStepForm` (flows and public
 * pages), the generated {Entity}Dialog and the public form's server-error line.
 * A field without a sentence falls back to the label sentence — never to a
 * bare „Dieses Feld ist erforderlich".
 *
 * Required fields per entity (from the base view):
 *   - geschaeftsbereiche: bezeichnung (Bezeichnung)
 *   - angebotsanfragen: anfragenummer (Anfragenummer), projekt (Projekt- bzw. Produktbezeichnung), kunde_firma (Kunde (Firma)), gesamtstatus (Gesamtstatus)
 *   - klaerpunkte: anfrage (Angebotsanfrage), geschaeftsbereich (Zuständiger Geschäftsbereich), titel (Titel), status (Status)
 */
import { t, tx } from '@/i18n';
import { labelOf, type EntityKey } from './rules';

/** The writable fields of each entity — the keys a message may address (generated). */
export interface MessageFields {
  "geschaeftsbereiche": "bezeichnung" | "kuerzel" | "zustaendigkeit" | "ansprechpartner_vorname" | "ansprechpartner_nachname" | "ansprechpartner_email" | "ansprechpartner_telefon" | "aktiv";
  "angebotsanfragen": "anfragenummer" | "projekt" | "eingangsdatum" | "angebotstermin" | "volumen" | "kunde_firma" | "kunde_vorname" | "kunde_nachname" | "beschreibung" | "gesamtstatus" | "prioritaet" | "federfuehrender_bereich" | "vertrieb_vorname" | "vertrieb_nachname" | "bemerkungen";
  "klaerpunkte": "anfrage" | "geschaeftsbereich" | "titel" | "frage" | "art" | "prioritaet" | "status" | "frist" | "bearbeiter_vorname" | "bearbeiter_nachname" | "antwort" | "auswirkung" | "klaerungsdatum";
}
export type MessageFieldKey<E extends EntityKey> = E extends keyof MessageFields ? MessageFields[E] : never;

export const REQUIRED_MESSAGES: { [E in EntityKey]?: Partial<Record<MessageFieldKey<E>, string>> } = {
  // <custom:messages>
  geschaeftsbereiche: { bezeichnung: "Bitte die Bezeichnung des Bereichs eingeben." },
  angebotsanfragen: { anfragenummer: "Bitte die Anfragenummer eingeben.", projekt: "Bitte das Projekt oder Produkt benennen.", kunde_firma: "Bitte die Kundenfirma eingeben.", gesamtstatus: "Bitte den Gesamtstatus wählen." },
  klaerpunkte: { anfrage: "Bitte eine Angebotsanfrage auswählen.", geschaeftsbereich: "Bitte den zuständigen Bereich auswählen.", titel: "Bitte einen Titel eingeben.", status: "Bitte einen Status wählen." },
  // </custom:messages>
};

/** The sentence shown when `key` of `entity` is required and empty — the
 *  agent's own text (translated at runtime like every page string), else the
 *  label sentence. Call it while rendering, not at module scope. */
export function requiredMessage(entity: EntityKey, key: string): string {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  if (own && own.trim()) return tx(own);
  return t('v_required', { label: labelOf(entity, key) });
}

/** True when the agent wrote a sentence for the field. */
export function hasOwnMessage(entity: EntityKey, key: string): boolean {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  return Boolean(own && own.trim());
}
