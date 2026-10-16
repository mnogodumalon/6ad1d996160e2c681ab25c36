/**
 * Klärpunkt beantworten — 4-Schritt-Wizard.
 * Steps: 1) Klärpunkt wählen → 2) Antwort & Auswirkung eintragen → 3) Status wählen → 4) Prüfen & speichern.
 * Reads: klaerpunkte (Pick, Anfrage-Name über ctx.ref). Writes: klaerpunkte (update via useKlaerpunktBearbeitenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup, fieldDate } from '@/lib/journey';
import { useKlaerpunktBearbeitenFlow } from '@/lib/journey/flows/KlaerpunktBearbeiten';
import { tx } from '@/i18n';

export default function KlaerpunktBearbeitenPage() {
  const [step, setStep] = useState(1);
  const flow = useKlaerpunktBearbeitenFlow({
    steps: { klaerpunkte: 1, antwort: 2, auswirkung: 2, bearbeiter_vorname: 2, bearbeiter_nachname: 2, status: 3 },
    items: {
      klaerpunkte: (r, ctx) => {
        const frist = fieldDate(r, 'frist');
        return {
          id: r.id,
          title: fieldText(r, 'titel'),
          subtitle: [ctx.ref('anfrage'), fieldText(r, 'frage')].filter(Boolean).join(' — '),
          status: fieldLookup(r, 'status') ?? undefined,
          stats: [
            { label: tx('Priorität'), value: fieldLookup(r, 'prioritaet')?.label ?? '—' },
            { label: tx('Frist'), value: frist ?? '—' },
          ],
        };
      },
    },
  });
  const f = flow.forms.klaerpunkte;

  const facts = flow.submit.result
    ? [
        { label: tx('Status'), value: fieldLookup(flow.submit.result.primary, 'status')?.label ?? '—' },
        { label: tx('Datum der Klärung'), value: fieldDate(flow.submit.result.primary, 'klaerungsdatum') ?? '—' },
      ]
    : undefined;

  return (
    <IntentWizardShell
      title={tx('Klärpunkt beantworten')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Beantworte einen offenen Klärpunkt und halte fest, was er fürs Angebot bedeutet.'),
        needs: [tx('Den Klärpunkt, den du bearbeitest'), tx('Deine Antwort'), tx('Den neuen Status')],
      }}
    >
      <WizardStep label={tx('Klärpunkt')} description={tx('Welchen Klärpunkt beantwortest du?')}>
        <EntitySelectStep
          {...flow.picks.klaerpunkte.select}
          {...flow.pick('klaerpunkte')}
          searchPlaceholder={tx('Titel suchen …')}
        />
      </WizardStep>

      <WizardStep
        label={tx('Antwort')}
        description={tx('Trage die Antwort ein und wie sie sich aufs Angebot auswirkt.')}
        needs={['klaerpunkte']}
      >
        <div className="space-y-4">
          <Bound form={f} name="antwort" rows={5} />
          <Bound form={f} name="auswirkung" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Bound form={f} name="bearbeiter_vorname" />
            <Bound form={f} name="bearbeiter_nachname" />
          </div>
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Status')}
          />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Status')}
        description={tx('Setze den Klärpunkt auf geklärt, Rückfrage oder einen anderen Stand.')}
        needs={['klaerpunkte']}
      >
        <div className="space-y-4">
          <Bound form={f} name="status" />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Der Klärpunkt wird aktualisiert. Das Klärungsdatum setzt das System automatisch.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          facts={facts}
          actions={{ copy: false, print: false }}
          restartLabel={tx('Weiteren Klärpunkt beantworten')}
          next={[
            { label: tx('Anfrage freigeben'), href: '#/intents/klaerung-abschliessen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Sind alle Klärpunkte einer Anfrage erledigt, kannst du sie freigeben.')}
        />
      )}
    </IntentWizardShell>
  );
}
