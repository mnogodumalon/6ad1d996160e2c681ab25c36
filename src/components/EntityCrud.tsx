/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'geschaeftsbereiche'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.geschaeftsbereiche.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.geschaeftsbereiche.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.geschaeftsbereiche.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.geschaeftsbereiche              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   geschaeftsbereiche: bezeichnung, kuerzel, zustaendigkeit, ansprechpartner_vorname, ansprechpartner_nachname, ansprechpartner_email, ansprechpartner_telefon, aktiv  ·  ← angebotsanfragen (list + contextual +) · ← klaerpunkte (list + contextual +)
 *   angebotsanfragen: anfragenummer, projekt, eingangsdatum, angebotstermin, volumen, kunde_firma, kunde_vorname, kunde_nachname, …  ·  → geschaeftsbereiche · ← klaerpunkte (list + contextual +)
 *   klaerpunkte: anfrage, geschaeftsbereich, titel, frage, art, prioritaet, status, frist, …  ·  → angebotsanfragen · → geschaeftsbereiche
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { Geschaeftsbereiche, Angebotsanfragen, Klaerpunkte } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { enrichAngebotsanfragen, enrichKlaerpunkte } from '@/lib/enrich';
import type { EnrichedAngebotsanfragen, EnrichedKlaerpunkte } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { GeschaeftsbereicheDialog, type GeschaeftsbereicheDialogDefaults } from '@/components/dialogs/GeschaeftsbereicheDialog';
import { GeschaeftsbereicheDetails } from '@/components/details/GeschaeftsbereicheDetails';
import { AngebotsanfragenDialog, type AngebotsanfragenDialogDefaults } from '@/components/dialogs/AngebotsanfragenDialog';
import { AngebotsanfragenDetails } from '@/components/details/AngebotsanfragenDetails';
import { KlaerpunkteDialog, type KlaerpunkteDialogDefaults } from '@/components/dialogs/KlaerpunkteDialog';
import { KlaerpunkteDetails } from '@/components/details/KlaerpunkteDetails';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { usePermissions } from '@/lib/permissions';
import { toast } from 'sonner';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'geschaeftsbereiche'; record: Geschaeftsbereiche }
  | { type: 'angebotsanfragen'; record: EnrichedAngebotsanfragen }
  | { type: 'klaerpunkte'; record: EnrichedKlaerpunkte };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
  /** May the signed-in user create/change records of this list? (the
   *  platform's rights — show a „+ Neu“ only when true; openCreate/openEdit
   *  refuse with a notice otherwise). */
  canWrite: boolean;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  geschaeftsbereiche: EntityCrudApi<Geschaeftsbereiche, GeschaeftsbereicheDialogDefaults>;
  angebotsanfragen: EntityCrudApi<Angebotsanfragen, AngebotsanfragenDialogDefaults>;
  klaerpunkte: EntityCrudApi<Klaerpunkte, KlaerpunkteDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { geschaeftsbereiche: Geschaeftsbereiche[]; angebotsanfragen: EnrichedAngebotsanfragen[]; klaerpunkte: EnrichedKlaerpunkte[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  // the platform's rights of the signed-in user (lib/permissions.ts) — unknown = allowed
  const perms = usePermissions();
  const refuse = () => { toast.error(t('perm_denied_title'), { description: t('perm_denied_desc') }); };
  const [geschaeftsbereicheDialog, setGeschaeftsbereicheDialog] = useState<{ defaults?: GeschaeftsbereicheDialogDefaults; editing?: Geschaeftsbereiche } | null>(null);
  const [angebotsanfragenDialog, setAngebotsanfragenDialog] = useState<{ defaults?: AngebotsanfragenDialogDefaults; editing?: Angebotsanfragen } | null>(null);
  const [klaerpunkteDialog, setKlaerpunkteDialog] = useState<{ defaults?: KlaerpunkteDialogDefaults; editing?: Klaerpunkte } | null>(null);
  const enrichedAngebotsanfragen = useMemo(() => enrichAngebotsanfragen(data.angebotsanfragen, { geschaeftsbereicheMap: data.geschaeftsbereicheMap }), [data.angebotsanfragen, data.geschaeftsbereicheMap]);
  const enrichedKlaerpunkte = useMemo(() => enrichKlaerpunkte(data.klaerpunkte, { angebotsanfragenMap: data.angebotsanfragenMap, geschaeftsbereicheMap: data.geschaeftsbereicheMap }), [data.klaerpunkte, data.angebotsanfragenMap, data.geschaeftsbereicheMap]);

  function detailGeschaeftsbereiche(record: Geschaeftsbereiche, push = false) {
    const item: OverlayItem = { type: 'geschaeftsbereiche', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitGeschaeftsbereiche(fields: Geschaeftsbereiche['fields']) {
    const editing = geschaeftsbereicheDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setGeschaeftsbereiche(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateGeschaeftsbereicheEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('geschaeftsbereiche')} — ${t('crud_updated')}`, async () => {
        data.setGeschaeftsbereiche(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateGeschaeftsbereicheEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createGeschaeftsbereicheEntry(fields);
      undoToast(`${appLabel('geschaeftsbereiche')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailAngebotsanfragen(record: Angebotsanfragen, push = false) {
    const rec = enrichedAngebotsanfragen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'angebotsanfragen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitAngebotsanfragen(fields: Angebotsanfragen['fields']) {
    const editing = angebotsanfragenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setAngebotsanfragen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateAngebotsanfragenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('angebotsanfragen')} — ${t('crud_updated')}`, async () => {
        data.setAngebotsanfragen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateAngebotsanfragenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createAngebotsanfragenEntry(fields);
      undoToast(`${appLabel('angebotsanfragen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailKlaerpunkte(record: Klaerpunkte, push = false) {
    const rec = enrichedKlaerpunkte.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'klaerpunkte', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitKlaerpunkte(fields: Klaerpunkte['fields']) {
    const editing = klaerpunkteDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setKlaerpunkte(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateKlaerpunkteEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('klaerpunkte')} — ${t('crud_updated')}`, async () => {
        data.setKlaerpunkte(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateKlaerpunkteEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createKlaerpunkteEntry(fields);
      undoToast(`${appLabel('klaerpunkte')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <GeschaeftsbereicheDialog
        open={geschaeftsbereicheDialog !== null}
        onClose={() => setGeschaeftsbereicheDialog(null)}
        onSubmit={submitGeschaeftsbereiche}
        defaultValues={geschaeftsbereicheDialog?.defaults}
        recordId={geschaeftsbereicheDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Geschaeftsbereiche']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Geschaeftsbereiche']}
      />
      <AngebotsanfragenDialog
        open={angebotsanfragenDialog !== null}
        onClose={() => setAngebotsanfragenDialog(null)}
        onSubmit={submitAngebotsanfragen}
        defaultValues={angebotsanfragenDialog?.defaults}
        recordId={angebotsanfragenDialog?.editing?.record_id}
        geschaeftsbereicheList={data.geschaeftsbereiche}
        enablePhotoScan={AI_PHOTO_SCAN['Angebotsanfragen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Angebotsanfragen']}
      />
      <KlaerpunkteDialog
        open={klaerpunkteDialog !== null}
        onClose={() => setKlaerpunkteDialog(null)}
        onSubmit={submitKlaerpunkte}
        defaultValues={klaerpunkteDialog?.defaults}
        recordId={klaerpunkteDialog?.editing?.record_id}
        angebotsanfragenList={data.angebotsanfragen}
        geschaeftsbereicheList={data.geschaeftsbereiche}
        enablePhotoScan={AI_PHOTO_SCAN['Klaerpunkte']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Klaerpunkte']}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'geschaeftsbereiche') {
            return (
              <>
                <RecordHeader title={top.record.fields.bezeichnung ?? appLabel('geschaeftsbereiche')} subtitle={undefined} />
                <GeschaeftsbereicheDetails
                  record={top.record}
                  angebotsanfragenList={data.angebotsanfragen}
                  onOpenAngebotsanfragen={(r) => detailAngebotsanfragen(r, true)}
                  onAddAngebotsanfragen={perms.canWrite('angebotsanfragen') ? () => setAngebotsanfragenDialog({ defaults: { federfuehrender_bereich: createRecordUrl(APP_IDS.GESCHAEFTSBEREICHE, top.record.record_id) } }) : undefined}
                  klaerpunkteList={data.klaerpunkte}
                  onOpenKlaerpunkte={(r) => detailKlaerpunkte(r, true)}
                  onAddKlaerpunkte={perms.canWrite('klaerpunkte') ? () => setKlaerpunkteDialog({ defaults: { geschaeftsbereich: createRecordUrl(APP_IDS.GESCHAEFTSBEREICHE, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'angebotsanfragen') {
            return (
              <>
                <RecordHeader title={top.record.fields.anfragenummer ?? appLabel('angebotsanfragen')} subtitle={top.record.fields.eingangsdatum ? formatDate(top.record.fields.eingangsdatum) : undefined} />
                <AngebotsanfragenDetails
                  record={top.record}
                  geschaeftsbereicheList={data.geschaeftsbereiche}
                  onOpenGeschaeftsbereiche={(r) => detailGeschaeftsbereiche(r, true)}
                  klaerpunkteList={data.klaerpunkte}
                  onOpenKlaerpunkte={(r) => detailKlaerpunkte(r, true)}
                  onAddKlaerpunkte={perms.canWrite('klaerpunkte') ? () => setKlaerpunkteDialog({ defaults: { anfrage: createRecordUrl(APP_IDS.ANGEBOTSANFRAGEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'klaerpunkte') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('klaerpunkte')} subtitle={top.record.fields.frist ? formatDate(top.record.fields.frist) : undefined} />
                <KlaerpunkteDetails
                  record={top.record}
                  angebotsanfragenList={data.angebotsanfragen}
                  onOpenAngebotsanfragen={(r) => detailAngebotsanfragen(r, true)}
                  geschaeftsbereicheList={data.geschaeftsbereiche}
                  onOpenGeschaeftsbereiche={(r) => detailGeschaeftsbereiche(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        canEdit={(top) => {
          if (top.type === 'geschaeftsbereiche') return perms.canWrite('geschaeftsbereiche');
          if (top.type === 'angebotsanfragen') return perms.canWrite('angebotsanfragen');
          if (top.type === 'klaerpunkte') return perms.canWrite('klaerpunkte');
          return true;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'geschaeftsbereiche') setGeschaeftsbereicheDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'angebotsanfragen') setAngebotsanfragenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'klaerpunkte') setKlaerpunkteDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    geschaeftsbereiche: {
      openCreate: (defaults?: GeschaeftsbereicheDialogDefaults) => (perms.canWrite('geschaeftsbereiche') ? setGeschaeftsbereicheDialog({ defaults }) : refuse()),
      openEdit: (record: Geschaeftsbereiche) => (perms.canWrite('geschaeftsbereiche') ? setGeschaeftsbereicheDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Geschaeftsbereiche) => detailGeschaeftsbereiche(record, false),
      canWrite: perms.canWrite('geschaeftsbereiche'),
    },
    angebotsanfragen: {
      openCreate: (defaults?: AngebotsanfragenDialogDefaults) => (perms.canWrite('angebotsanfragen') ? setAngebotsanfragenDialog({ defaults }) : refuse()),
      openEdit: (record: Angebotsanfragen) => (perms.canWrite('angebotsanfragen') ? setAngebotsanfragenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Angebotsanfragen) => detailAngebotsanfragen(record, false),
      canWrite: perms.canWrite('angebotsanfragen'),
    },
    klaerpunkte: {
      openCreate: (defaults?: KlaerpunkteDialogDefaults) => (perms.canWrite('klaerpunkte') ? setKlaerpunkteDialog({ defaults }) : refuse()),
      openEdit: (record: Klaerpunkte) => (perms.canWrite('klaerpunkte') ? setKlaerpunkteDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Klaerpunkte) => detailKlaerpunkte(record, false),
      canWrite: perms.canWrite('klaerpunkte'),
    },
    enriched: { geschaeftsbereiche: data.geschaeftsbereiche, angebotsanfragen: enrichedAngebotsanfragen, klaerpunkte: enrichedKlaerpunkte },
  };
}
