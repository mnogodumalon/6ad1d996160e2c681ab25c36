import type { Geschaeftsbereiche, Angebotsanfragen, Klaerpunkte } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface GeschaeftsbereicheDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Geschaeftsbereiche;
  /** 1:N „Angebotsanfragen" (federfuehrender_bereich): VOLLE Liste — der Block filtert auf diesen Record. */
  angebotsanfragenList: Angebotsanfragen[];
  /** Zeilen-Klick → overlay.push auf das Angebotsanfragen-Detail (nie der Edit-Dialog). */
  onOpenAngebotsanfragen: (record: Angebotsanfragen) => void;
  /** Kontextuelles „+": öffnet den Angebotsanfragen-Dialog mit diesem Record vorgesetzt. */
  onAddAngebotsanfragen?: () => void;
  /** 1:N „Klärpunkte" (geschaeftsbereich): VOLLE Liste — der Block filtert auf diesen Record. */
  klaerpunkteList: Klaerpunkte[];
  /** Zeilen-Klick → overlay.push auf das Klaerpunkte-Detail (nie der Edit-Dialog). */
  onOpenKlaerpunkte: (record: Klaerpunkte) => void;
  /** Kontextuelles „+": öffnet den Klaerpunkte-Dialog mit diesem Record vorgesetzt. */
  onAddKlaerpunkte?: () => void;
}

export function GeschaeftsbereicheDetails({
  record,
  angebotsanfragenList,
  onOpenAngebotsanfragen,
  onAddAngebotsanfragen,
  klaerpunkteList,
  onOpenKlaerpunkte,
  onAddKlaerpunkte,
}: GeschaeftsbereicheDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('geschaeftsbereiche', 'bezeichnung')} value={record.fields.bezeichnung} format="text" />
        <RecordField label={fieldLabel('geschaeftsbereiche', 'kuerzel')} value={record.fields.kuerzel} format="text" />
        <RecordField label={fieldLabel('geschaeftsbereiche', 'zustaendigkeit')} value={record.fields.zustaendigkeit} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('geschaeftsbereiche', 'ansprechpartner_vorname')} value={record.fields.ansprechpartner_vorname} format="text" />
        <RecordField label={fieldLabel('geschaeftsbereiche', 'ansprechpartner_nachname')} value={record.fields.ansprechpartner_nachname} format="text" />
        <RecordField label={fieldLabel('geschaeftsbereiche', 'ansprechpartner_email')} value={record.fields.ansprechpartner_email} format="email" />
        <RecordField label={fieldLabel('geschaeftsbereiche', 'ansprechpartner_telefon')} value={record.fields.ansprechpartner_telefon} format="text" />
        <RecordField label={fieldLabel('geschaeftsbereiche', 'aktiv')} value={record.fields.aktiv} format="bool" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('angebotsanfragen')}
        items={angebotsanfragenList.filter(r => extractRecordId(r.fields.federfuehrender_bereich) === record.record_id)}
        map={r => ({ name: r.fields.anfragenummer ?? appLabel('angebotsanfragen'), meta: r.fields.eingangsdatum })}
        onOpen={onOpenAngebotsanfragen}
        onAdd={onAddAngebotsanfragen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('klaerpunkte')}
        items={klaerpunkteList.filter(r => extractRecordId(r.fields.geschaeftsbereich) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('klaerpunkte'), meta: r.fields.frist })}
        onOpen={onOpenKlaerpunkte}
        onAdd={onAddKlaerpunkte}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.GESCHAEFTSBEREICHE} recordId={record.record_id} readOnly={!perms.canWrite('geschaeftsbereiche')} />
    </>
  );
}
