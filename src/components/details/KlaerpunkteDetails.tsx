import type { Klaerpunkte, Angebotsanfragen, Geschaeftsbereiche } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface KlaerpunkteDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Klaerpunkte;
  /** N:1-Ziel „Angebotsanfragen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  angebotsanfragenList: Angebotsanfragen[];
  /** Klick auf die Angebotsanfragen-Relation → overlay.push auf dessen Detail. */
  onOpenAngebotsanfragen?: (record: Angebotsanfragen) => void;
  /** N:1-Ziel „Geschaeftsbereiche": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  geschaeftsbereicheList: Geschaeftsbereiche[];
  /** Klick auf die Geschaeftsbereiche-Relation → overlay.push auf dessen Detail. */
  onOpenGeschaeftsbereiche?: (record: Geschaeftsbereiche) => void;
}

export function KlaerpunkteDetails({
  record,
  angebotsanfragenList,
  onOpenAngebotsanfragen,
  geschaeftsbereicheList,
  onOpenGeschaeftsbereiche,
}: KlaerpunkteDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const anfrageTarget = angebotsanfragenList.find(r => r.record_id === extractRecordId(record.fields.anfrage));
  const geschaeftsbereichTarget = geschaeftsbereicheList.find(r => r.record_id === extractRecordId(record.fields.geschaeftsbereich));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('klaerpunkte', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('klaerpunkte', 'frage')} value={record.fields.frage} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('klaerpunkte', 'art')} value={record.fields.art} format="pill" />
        <RecordField label={fieldLabel('klaerpunkte', 'prioritaet')} value={record.fields.prioritaet} format="pill" />
        <RecordField label={fieldLabel('klaerpunkte', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('klaerpunkte', 'frist')} value={record.fields.frist} format="date" />
        <RecordField label={fieldLabel('klaerpunkte', 'bearbeiter_vorname')} value={record.fields.bearbeiter_vorname} format="text" />
        <RecordField label={fieldLabel('klaerpunkte', 'bearbeiter_nachname')} value={record.fields.bearbeiter_nachname} format="text" />
        <RecordField label={fieldLabel('klaerpunkte', 'antwort')} value={record.fields.antwort} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('klaerpunkte', 'auswirkung')} value={Array.isArray(record.fields.auswirkung) ? record.fields.auswirkung.map((v: unknown) => (v && typeof v === 'object' && 'label' in v) ? (v as {label: unknown}).label : v).join(', ') : null} format="text" />
        <RecordField label={fieldLabel('klaerpunkte', 'klaerungsdatum')} value={record.fields.klaerungsdatum} format="date" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('klaerpunkte', 'anfrage')}
          name={anfrageTarget?.fields.anfragenummer ?? '—'}
          meta={[anfrageTarget?.fields.projekt, anfrageTarget?.fields.kunde_firma].filter(Boolean).join(' · ') || undefined}
          onClick={anfrageTarget && onOpenAngebotsanfragen ? () => onOpenAngebotsanfragen!(anfrageTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('klaerpunkte', 'geschaeftsbereich')}
          name={geschaeftsbereichTarget?.fields.bezeichnung ?? '—'}
          meta={[geschaeftsbereichTarget?.fields.ansprechpartner_email, geschaeftsbereichTarget?.fields.ansprechpartner_telefon].filter(Boolean).join(' · ') || undefined}
          onClick={geschaeftsbereichTarget && onOpenGeschaeftsbereiche ? () => onOpenGeschaeftsbereiche!(geschaeftsbereichTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.KLAERPUNKTE} recordId={record.record_id} readOnly={!perms.canWrite('klaerpunkte')} />
    </>
  );
}
