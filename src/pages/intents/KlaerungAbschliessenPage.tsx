/**
 * Anfrage freigeben — 3-Schritt-Wizard.
 * Steps: 1) Anfrage in Klärung wählen → 2) Offene Klärpunkte prüfen (+ Bemerkung) → 3) Prüfen & auf „Bereit zur Angebotserstellung“ setzen.
 * Reads: angebotsanfragen, klaerpunkte. Writes: angebotsanfragen (update gesamtstatus, bemerkungen) via useKlaerungAbschliessenFlow.
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, StatusBadge, SummaryStep, SuccessStep.
 */
import { useEffect, useState } from 'react';
import { IconCircleCheck, IconAlertTriangle } from '@tabler/icons-react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { StatusBadge } from '@/components/blocks/StatusBadge';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import {
  fieldText, fieldLookup, fieldRef, fieldDate, refFilter, formatFieldValue, optionsOf,
  type JourneyRecord,
} from '@/lib/journey';
import { useKlaerungAbschliessenFlow } from '@/lib/journey/flows/KlaerungAbschliessen';
import { tx } from '@/i18n';

const OPEN_STATES = ['offen', 'in_bearbeitung', 'rueckfrage_kunde'];

export default function KlaerungAbschliessenPage() {
  const [step, setStep] = useState(1);
  const flow = useKlaerungAbschliessenFlow({
    steps: { angebotsanfragen: 1, bemerkungen: 2 },
    items: {
      angebotsanfragen: r => ({
        id: r.id,
        title: fieldText(r, 'anfragenummer'),
        subtitle: [fieldText(r, 'projekt'), fieldText(r, 'kunde_firma')].filter(Boolean).join(' · '),
        status: fieldLookup(r, 'gesamtstatus') ?? undefined,
        stats: fieldDate(r, 'angebotstermin')
          ? [{ label: tx('Angebotstermin'), value: formatFieldValue('angebotsanfragen', 'angebotstermin', fieldDate(r, 'angebotstermin')) }]
          : undefined,
      }),
    },
  });
  const form = flow.forms.angebotsanfragen;
  const anfrageId = (flow.pick('angebotsanfragen').selectedId as string | null | undefined) ?? null;

  const [punkte, setPunkte] = useState<JourneyRecord[]>([]);
  const [punkteLoading, setPunkteLoading] = useState(false);
  const [punkteError, setPunkteError] = useState<string | null>(null);

  useEffect(() => {
    if (!anfrageId) { setPunkte([]); return; }
    let cancelled = false;
    setPunkteLoading(true);
    setPunkteError(null);
    flow.port
      .list('klaerpunkte', { filter: refFilter('anfrage', anfrageId), limit: 200 })
      .then(rows => { if (!cancelled) setPunkte(rows.filter(r => fieldRef(r, 'anfrage') === anfrageId)); })
      .catch(e => { if (!cancelled) setPunkteError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setPunkteLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anfrageId]);

  const openPunkte = punkte.filter(p => OPEN_STATES.includes(fieldLookup(p, 'status')?.key ?? ''));
  const blockMessage = tx('Es gibt noch offene Klärpunkte zu dieser Anfrage.');
  const targetLabel = optionsOf('angebotsanfragen', 'gesamtstatus').find(o => o.key === 'bereit_angebot')?.label ?? '';

  return (
    <IntentWizardShell
      title={tx('Anfrage freigeben')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{ description: tx('Sind alle Klärpunkte erledigt, gibst du die Anfrage zur Angebotserstellung frei.'), needs: [tx('Die Anfrage, die in Klärung ist')] }}
    >
      <WizardStep label={tx('Anfrage')} description={tx('Welche Anfrage ist fertig geklärt?')}>
        <EntitySelectStep
          {...flow.picks.angebotsanfragen.select}
          {...flow.pick('angebotsanfragen')}
          searchPlaceholder={tx('Anfragenummer, Projekt oder Kunde …')}
        />
      </WizardStep>

      <WizardStep label={tx('Klärpunkte')} description={tx('Alle Klärpunkte müssen erledigt sein, bevor die Anfrage freigegeben wird.')} needs={['angebotsanfragen']}>
        <div className="space-y-4">
          {punkteLoading && <p className="text-sm text-muted-foreground">{tx('Klärpunkte werden geladen …')}</p>}
          {punkteError && <p className="text-sm text-destructive">{punkteError}</p>}
          {!punkteLoading && !punkteError && (
            <div
              className={`flex items-start gap-3 rounded-2xl border p-4 ${openPunkte.length > 0 ? 'border-destructive/40 bg-destructive/10' : 'border-emerald-500/40 bg-emerald-500/10'}`}
            >
              {openPunkte.length > 0
                ? <IconAlertTriangle size={20} className="mt-0.5 shrink-0 text-destructive" />
                : <IconCircleCheck size={20} className="mt-0.5 shrink-0 text-emerald-600" />}
              <p className="min-w-0 text-sm">
                {openPunkte.length > 0
                  ? tx`${openPunkte.length} von ${punkte.length} Klärpunkten sind noch nicht erledigt.`
                  : punkte.length === 0
                    ? tx('Zu dieser Anfrage gibt es keine Klärpunkte.')
                    : tx`Alle ${punkte.length} Klärpunkte sind erledigt.`}
              </p>
            </div>
          )}
          {punkte.length > 0 && (
            <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
              {punkte.map(p => {
                const st = fieldLookup(p, 'status');
                const frist = fieldDate(p, 'frist');
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{fieldText(p, 'titel')}</p>
                      {frist && (
                        <p className="text-xs text-muted-foreground">
                          {tx('Frist')}: {formatFieldValue('klaerpunkte', 'frist', frist)}
                        </p>
                      )}
                    </div>
                    <StatusBadge statusKey={st?.key} label={st?.label} tone={st && OPEN_STATES.includes(st.key) ? 'warning' : 'positive'} />
                  </li>
                );
              })}
            </ul>
          )}
          {openPunkte.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {tx('Offene Punkte beantwortest du im Ablauf')}{' '}
              <a className="underline" href="#/intents/klaerpunkt-bearbeiten">{tx('Klärpunkt beantworten')}</a>.
            </p>
          )}
          <Bound form={form} name="bemerkungen" rows={3} hint={tx('Interne Notiz zur Freigabe, z. B. Ergebnis der Klärung')} />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => {
              if (punkteLoading) return tx('Die Klärpunkte werden noch geladen.');
              if (openPunkte.length > 0) return blockMessage;
              return flow.validateStep(2);
            }}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')} description={tx('Anfrage auf „bereit zur Angebotserstellung“ setzen.')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'gesamtstatus', label: tx('Neuer Gesamtstatus'), value: targetLabel }]}
            confirmLabel={tx('Anfrage freigeben')}
            whatHappensNext={tx('Die Anfrage erscheint danach als bereit zur Angebotserstellung.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          submit={flow.submit}
          facts={[
            { label: tx('Anfrage'), value: fieldText(flow.submit.result.primary, 'anfragenummer') || '—' },
            { label: tx('Gesamtstatus'), value: fieldLookup(flow.submit.result.primary, 'gesamtstatus')?.label ?? targetLabel },
          ]}
          whatHappensNext={tx('Das Angebot kann jetzt erstellt werden.')}
          next={[
            { label: tx('Weitere Anfrage freigeben'), onClick: () => { flow.reset(); setStep(1); } },
            { label: tx('Klärpunkt beantworten'), href: '#/intents/klaerpunkt-bearbeiten' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
