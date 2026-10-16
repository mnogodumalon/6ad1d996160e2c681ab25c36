import type { Angebotsanfragen, Geschaeftsbereiche, Klaerpunkte } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface AngebotsanfragenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Angebotsanfragen;
  /** N:1-Ziel „Geschaeftsbereiche": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  geschaeftsbereicheList: Geschaeftsbereiche[];
  /** Klick auf die Geschaeftsbereiche-Relation → overlay.push auf dessen Detail. */
  onOpenGeschaeftsbereiche?: (record: Geschaeftsbereiche) => void;
  /** 1:N „Klärpunkte" (anfrage): VOLLE Liste — der Block filtert auf diesen Record. */
  klaerpunkteList: Klaerpunkte[];
  /** Zeilen-Klick → overlay.push auf das Klaerpunkte-Detail (nie der Edit-Dialog). */
  onOpenKlaerpunkte: (record: Klaerpunkte) => void;
  /** Kontextuelles „+": öffnet den Klaerpunkte-Dialog mit diesem Record vorgesetzt. */
  onAddKlaerpunkte?: () => void;
}

export function AngebotsanfragenDetails({
  record,
  geschaeftsbereicheList,
  onOpenGeschaeftsbereiche,
  klaerpunkteList,
  onOpenKlaerpunkte,
  onAddKlaerpunkte,
}: AngebotsanfragenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const federfuehrender_bereichTarget = geschaeftsbereicheList.find(r => r.record_id === extractRecordId(record.fields.federfuehrender_bereich));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('angebotsanfragen', 'anfragenummer')} value={record.fields.anfragenummer} format="text" />
        <RecordField label={fieldLabel('angebotsanfragen', 'projekt')} value={record.fields.projekt} format="text" />
        <RecordField label={fieldLabel('angebotsanfragen', 'eingangsdatum')} value={record.fields.eingangsdatum} format="date" />
        <RecordField label={fieldLabel('angebotsanfragen', 'angebotstermin')} value={record.fields.angebotstermin} format="date" />
        <RecordField label={fieldLabel('angebotsanfragen', 'volumen')} value={record.fields.volumen} format="text" />
        <RecordField label={fieldLabel('angebotsanfragen', 'kunde_firma')} value={record.fields.kunde_firma} format="text" />
        <RecordField label={fieldLabel('angebotsanfragen', 'kunde_vorname')} value={record.fields.kunde_vorname} format="text" />
        <RecordField label={fieldLabel('angebotsanfragen', 'kunde_nachname')} value={record.fields.kunde_nachname} format="text" />
        <RecordField label={fieldLabel('angebotsanfragen', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('angebotsanfragen', 'gesamtstatus')} value={record.fields.gesamtstatus} format="pill" />
        <RecordField label={fieldLabel('angebotsanfragen', 'prioritaet')} value={record.fields.prioritaet} format="pill" />
        <RecordField label={fieldLabel('angebotsanfragen', 'vertrieb_vorname')} value={record.fields.vertrieb_vorname} format="text" />
        <RecordField label={fieldLabel('angebotsanfragen', 'vertrieb_nachname')} value={record.fields.vertrieb_nachname} format="text" />
        <RecordField label={fieldLabel('angebotsanfragen', 'bemerkungen')} value={record.fields.bemerkungen} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('angebotsanfragen', 'federfuehrender_bereich')}
          name={federfuehrender_bereichTarget?.fields.bezeichnung ?? '—'}
          meta={[federfuehrender_bereichTarget?.fields.ansprechpartner_email, federfuehrender_bereichTarget?.fields.ansprechpartner_telefon].filter(Boolean).join(' · ') || undefined}
          onClick={federfuehrender_bereichTarget && onOpenGeschaeftsbereiche ? () => onOpenGeschaeftsbereiche!(federfuehrender_bereichTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('klaerpunkte')}
        items={klaerpunkteList.filter(r => extractRecordId(r.fields.anfrage) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('klaerpunkte'), meta: r.fields.frist })}
        onOpen={onOpenKlaerpunkte}
        onAdd={onAddKlaerpunkte}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ANGEBOTSANFRAGEN} recordId={record.record_id} readOnly={!perms.canWrite('angebotsanfragen')} />
    </>
  );
}
