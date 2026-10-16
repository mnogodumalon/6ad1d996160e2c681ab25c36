import { useMemo, useState } from 'react';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { IconAlertTriangle, IconPlus, IconInbox } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import type { EnrichedKlaerpunkte } from '@/types/enriched';
import type { Angebotsanfragen, Klaerpunkte } from '@/types/app';
import { LOOKUP_OPTIONS, lookupOption } from '@/types/app';
import { LivingAppsService, extractRecordId } from '@/services/livingAppsService';
import { formatDate, lookupKey } from '@/lib/formatters';
import { tx } from '@/i18n';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { Button } from '@/components/ui/button';
import { KanbanWidget, type KanbanCard, type KanbanColumn, type KanbanTone } from '@/components/widgets/KanbanWidget';
import { ChartWidget, type ChartRow } from '@/components/widgets/ChartWidget';

const CLOSED = ['geklaert', 'nicht_relevant'];
const NEXT_STATUS: Record<string, string> = {
  offen: 'in_bearbeitung',
  in_bearbeitung: 'geklaert',
  rueckfrage_kunde: 'geklaert',
};

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { angebotsanfragen, klaerpunkte, setKlaerpunkte, setAngebotsanfragen, fetchAll } = data;
  const clock = useClock();
  const today = format(clock, 'yyyy-MM-dd');
  const [focusSoon, setFocusSoon] = useState(false);

  const isOpen = (k: Klaerpunkte) => !CLOSED.includes(lookupKey(k.fields.status) ?? 'offen');

  // ---- shared write helpers (hero, work list, overlay footer) ----
  const advanceKlaer = (k: Klaerpunkte) => {
    const cur = lookupKey(k.fields.status) ?? 'offen';
    const next = NEXT_STATUS[cur];
    if (!next) return;
    const prevStatus = k.fields.status;
    const prevDate = k.fields.klaerungsdatum;
    const patch: Partial<Klaerpunkte['fields']> = { status: lookupOption('klaerpunkte', 'status', next) };
    if (next === 'geklaert') patch.klaerungsdatum = today;
    setKlaerpunkte(prev => prev.map(r => r.record_id === k.record_id ? { ...r, fields: { ...r.fields, ...patch } } : r));
    const write: Record<string, unknown> = { status: next };
    if (next === 'geklaert') write.klaerungsdatum = today;
    LivingAppsService.updateKlaerpunkteEntry(k.record_id, write as never).catch(() => fetchAll());
    undoToast(tx`${k.fields.titel ?? ''} — ${lookupOption('klaerpunkte', 'status', next).label}`, () => {
      setKlaerpunkte(prev => prev.map(r => r.record_id === k.record_id
        ? { ...r, fields: { ...r.fields, status: prevStatus, klaerungsdatum: prevDate } } : r));
      LivingAppsService.updateKlaerpunkteEntry(k.record_id, { status: cur }).catch(() => fetchAll());
    });
  };

  const statsByAnfrage = useMemo(() => {
    const m = new Map<string, { open: number; done: number }>();
    for (const k of klaerpunkte) {
      const id = extractRecordId(k.fields.anfrage);
      if (!id) continue;
      const s = m.get(id) ?? { open: 0, done: 0 };
      const st = lookupKey(k.fields.status) ?? 'offen';
      if (st === 'geklaert') s.done++;
      else if (!CLOSED.includes(st)) s.open++;
      m.set(id, s);
    }
    return m;
  }, [klaerpunkte]);

  const moveAnfrage = (a: Angebotsanfragen, col: string): string | undefined => {
    const open = statsByAnfrage.get(a.record_id)?.open ?? 0;
    if (col === 'bereit_angebot' && open > 0) {
      return open === 1
        ? tx`Noch 1 offener Klärpunkt — erst klären, dann freigeben.`
        : tx`Noch ${open} offene Klärpunkte — erst klären, dann freigeben.`;
    }
    const prev = a.fields.gesamtstatus;
    const prevKey = lookupKey(prev);
    setAngebotsanfragen(p => p.map(r => r.record_id === a.record_id
      ? { ...r, fields: { ...r.fields, gesamtstatus: lookupOption('angebotsanfragen', 'gesamtstatus', col) } } : r));
    LivingAppsService.updateAngebotsanfragenEntry(a.record_id, { gesamtstatus: col }).catch(() => fetchAll());
    undoToast(tx`${a.fields.anfragenummer ?? ''} — ${lookupOption('angebotsanfragen', 'gesamtstatus', col).label}`, () => {
      setAngebotsanfragen(p => p.map(r => r.record_id === a.record_id ? { ...r, fields: { ...r.fields, gesamtstatus: prev } } : r));
      LivingAppsService.updateAngebotsanfragenEntry(a.record_id, { gesamtstatus: prevKey }).catch(() => fetchAll());
    });
    return undefined;
  };

  const crud = useEntityCrud(data, {
    footer: (top) => {
      if (top.type === 'klaerpunkte') {
        const cur = lookupKey(top.record.fields.status) ?? 'offen';
        const next = NEXT_STATUS[cur];
        if (!next) return undefined;
        return { label: next === 'geklaert' ? tx('Als geklärt markieren') : tx('Bearbeitung starten'), onClick: () => advanceKlaer(top.record) };
      }
      if (top.type === 'angebotsanfragen') {
        const cur = lookupKey(top.record.fields.gesamtstatus) ?? 'neu';
        const open = statsByAnfrage.get(top.record.record_id)?.open ?? 0;
        if (cur === 'neu') return { label: tx('In Klärung setzen'), onClick: () => moveAnfrage(top.record, 'in_klaerung') };
        if (cur === 'in_klaerung' && open === 0) return { label: tx('Bereit zur Angebotserstellung'), onClick: () => moveAnfrage(top.record, 'bereit_angebot') };
        if (cur === 'bereit_angebot') return { label: tx('Angebot erstellt'), onClick: () => moveAnfrage(top.record, 'angebot_erstellt') };
      }
      return undefined;
    },
  });
  const enrichedKlaerpunkte = crud.enriched.klaerpunkte;

  // ---- derived data ----
  const openKlaer = useMemo(
    () => enrichedKlaerpunkte.filter(isOpen)
      .sort((a, b) => (a.fields.frist ?? '9999').localeCompare(b.fields.frist ?? '9999')),
    [enrichedKlaerpunkte], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const overdue = openKlaer.filter(k => k.fields.frist && k.fields.frist.slice(0, 10) < today);
  const doneCount = klaerpunkte.filter(k => lookupKey(k.fields.status) === 'geklaert').length;
  const relevantCount = klaerpunkte.filter(k => lookupKey(k.fields.status) !== 'nicht_relevant').length;

  const soonSet = useMemo(() => {
    const s = new Set<string>();
    for (const a of angebotsanfragen) {
      const st = lookupKey(a.fields.gesamtstatus) ?? 'neu';
      if (st !== 'neu' && st !== 'in_klaerung') continue;
      if (!a.fields.angebotstermin) continue;
      const d = differenceInCalendarDays(parseISO(a.fields.angebotstermin.slice(0, 10)), clock);
      if (d <= 14) s.add(a.record_id);
    }
    return s;
  }, [angebotsanfragen, clock]);

  const bereit = angebotsanfragen.filter(a => lookupKey(a.fields.gesamtstatus) === 'bereit_angebot');

  const columns: KanbanColumn[] = (LOOKUP_OPTIONS['angebotsanfragen']?.['gesamtstatus'] ?? []).map(o => ({ key: o.key, label: o.label }));

  const cards: KanbanCard[] = angebotsanfragen
    .filter(a => !focusSoon || soonSet.has(a.record_id))
    .sort((a, b) => (a.fields.angebotstermin ?? '9999').localeCompare(b.fields.angebotstermin ?? '9999'))
    .map(a => {
      const s = statsByAnfrage.get(a.record_id) ?? { open: 0, done: 0 };
      const col = lookupKey(a.fields.gesamtstatus) ?? 'neu';
      const prio = lookupKey(a.fields.prioritaet);
      const tone: KanbanTone = col === 'bereit_angebot' ? 'success' : prio === 'dringend' ? 'warning' : 'default';
      const termin = a.fields.angebotstermin ? tx`Termin ${formatDate(a.fields.angebotstermin)}` : tx`ohne Termin`;
      return {
        id: `anfrage:${a.record_id}`,
        column: col,
        title: `${a.fields.anfragenummer ?? ''} · ${a.fields.projekt ?? ''}`,
        subtitle: tx`${s.open} offen · ${s.done} geklärt · ${termin}`,
        tone,
      };
    });

  const chartRows: ChartRow<EnrichedKlaerpunkte>[] = openKlaer.map(k => ({ id: `klaerpunkt:${k.record_id}`, data: k }));

  const klaerItem = (k: EnrichedKlaerpunkte) => {
    const st = lookupKey(k.fields.status) ?? 'offen';
    const next = NEXT_STATUS[st];
    return {
      id: k.record_id,
      title: k.fields.titel ?? '—',
      secondLine: (
        <>
          <span className="font-medium">{k.fields.status?.label ?? tx('Offen')}</span>
          <span className="text-muted-foreground"> · {k.geschaeftsbereichName} · {k.anfrageName}{k.fields.frist ? ` · ${formatDate(k.fields.frist)}` : ''}</span>
        </>
      ),
      action: next ? { label: next === 'geklaert' ? tx('✓ Geklärt') : tx('▶ Start'), onClick: () => advanceKlaer(k) } : undefined,
    };
  };

  const openKlaerById = (id: string) => {
    const k = klaerpunkte.find(r => r.record_id === id);
    if (k) crud.klaerpunkte.openDetail(k);
  };

  // ---- header context line ----
  const bereiche = [...new Set(openKlaer.map(k => k.geschaeftsbereichName).filter(Boolean))];
  let context: string;
  if (angebotsanfragen.length === 0) context = tx`Erfasse die erste Angebotsanfrage und verteile Klärpunkte an die Bereiche.`;
  else if (overdue.length > 0) context = tx`Frist überschritten bei ${namen(overdue.map(k => k.anfrageName))} — dort hakt es gerade.`;
  else if (openKlaer.length > 0) context = tx`Offene Klärpunkte warten bei ${namen(bereiche)}.`;
  else if (bereit.length > 0) context = tx`Bereit zur Angebotserstellung: ${namen(bereit.map(a => a.fields.anfragenummer ?? ''))}.`;
  else context = tx`Alle Klärpunkte sind geklärt — ${namen(angebotsanfragen.slice(0, 3).map(a => a.fields.anfragenummer ?? ''))} im Blick.`;

  const first = overdue[0];
  const hero = angebotsanfragen.length === 0 ? (
    <HeroBanner icon={<IconInbox size={48} />} action={{ label: tx('Erste Anfrage erfassen'), onClick: () => crud.angebotsanfragen.openCreate({ gesamtstatus: 'neu' }) }}>
      {tx('Noch keine Angebotsanfragen — leg die erste an und klär sie mit den Geschäftsbereichen.')}
    </HeroBanner>
  ) : first ? (
    <HeroBanner icon={<IconAlertTriangle size={18} />}
      action={NEXT_STATUS[lookupKey(first.fields.status) ?? 'offen']
        ? { label: lookupKey(first.fields.status) === 'in_bearbeitung' || lookupKey(first.fields.status) === 'rueckfrage_kunde' ? tx('Als geklärt markieren') : tx('Bearbeitung starten'), onClick: () => advanceKlaer(first) }
        : { label: tx('Öffnen'), onClick: () => crud.klaerpunkte.openDetail(first) }}>
      {overdue.length === 1
        ? tx`${first.fields.titel ?? ''} (${first.geschaeftsbereichName}) ist überfällig — Frist war ${formatDate(first.fields.frist)}.`
        : tx`${overdue.length} Klärpunkte überfällig, zuerst ${first.fields.titel ?? ''} (${first.geschaeftsbereichName}, Frist ${formatDate(first.fields.frist)}).`}
    </HeroBanner>
  ) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
          <p className="text-sm text-muted-foreground">{context}</p>
        </div>
        {crud.angebotsanfragen.canWrite && (
          <Button onClick={() => crud.angebotsanfragen.openCreate({ gesamtstatus: 'neu' })}>
            <IconPlus size={16} className="shrink-0" />
            <span className="ml-1">{tx('Neue Anfrage')}</span>
          </Button>
        )}
      </div>

      <DashboardGrid
        variant="wide"
        hero={hero}
        kpis={angebotsanfragen.length > 0 ? (
          <StatStrip>
            <StatStripItem title={tx('Klärpunkte geklärt')} value={`${doneCount} / ${relevantCount}`} />
            <StatStripItem
              title={tx('Termin in ≤ 14 Tagen')}
              value={soonSet.size}
              tone={soonSet.size > 0 ? 'warning' : 'default'}
              onClick={() => setFocusSoon(f => !f)}
              active={focusSoon}
            />
          </StatStrip>
        ) : undefined}
        aside={angebotsanfragen.length > 0 ? (
          <>
            <WorkList
              title={tx('Offene Klärpunkte nach Frist')}
              items={openKlaer.map(klaerItem)}
              max={6}
              onItemClick={openKlaerById}
              empty={{
                text: bereit.length > 0 ? tx`Nichts offen — bereit: ${bereit[0].fields.anfragenummer ?? ''}` : tx('Nichts offen.'),
                action: crud.klaerpunkte.canWrite ? { label: tx('Klärpunkt anlegen'), onClick: () => crud.klaerpunkte.openCreate({ status: 'offen' }) } : undefined,
              }}
            />
            {chartRows.length > 0 && (
              <ChartWidget<EnrichedKlaerpunkte>
                title={tx('Offene Klärpunkte je Geschäftsbereich')}
                rows={chartRows}
                dimension={{ kind: 'category', accessor: r => r.data.geschaeftsbereichName, label: tx('Geschäftsbereich') }}
              />
            )}
          </>
        ) : undefined}
        primary={
          <KanbanWidget
            cards={cards}
            columns={columns}
            defaultCollapsed={['angebot_erstellt', 'abgelehnt']}
            onCardClick={card => {
              const a = angebotsanfragen.find(r => r.record_id === card.id.split(':')[1]);
              if (a) crud.angebotsanfragen.openDetail(a);
            }}
            onCardMove={(cardId, col) => {
              const a = angebotsanfragen.find(r => r.record_id === cardId.split(':')[1]);
              return a ? moveAnfrage(a, col) : undefined;
            }}
            onAddCard={col => crud.angebotsanfragen.openCreate({ gesamtstatus: col })}
          />
        }
      />
      {crud.surfaces}
    </div>
  );
}
