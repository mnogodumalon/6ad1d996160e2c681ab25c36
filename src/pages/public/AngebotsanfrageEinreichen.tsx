import { useEffect, useMemo, useState } from 'react';
import { PublicShell } from '@/components/PublicShell';
import { Button } from '@/components/ui/button';
import { Bound } from '@/components/blocks/Bound';
import { FieldErrorSummary } from '@/components/blocks/FieldErrorSummary';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { useStepForm, useJourneySubmit } from '@/lib/journey';
import { createPublicPort } from '@/lib/journey/publicPort';
import {
  loadPublicPagesConfig, prepareChallenge,
  type PublicPagesConfig, type PublicPageConfig,
} from '@/lib/publicClient';
import { tx } from '@/i18n';

const SLUG = 'angebotsanfrage-einreichen';

export default function AngebotsanfrageEinreichen() {
  const [cfg, setCfg] = useState<PublicPagesConfig | null>(null);
  const [page, setPage] = useState<PublicPageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicPagesConfig(SLUG).then(c => {
      setCfg(c);
      setPage(c?.pages[SLUG] ?? null);
      setLoading(false);
    });
  }, []);

  const port = useMemo(() => (cfg && page ? createPublicPort(cfg, page) : null), [cfg, page]);

  const anfrage = useStepForm('angebotsanfragen', {
    fields: [
      'projekt', 'kunde_firma', 'kunde_vorname', 'kunde_nachname',
      'beschreibung', 'angebotstermin', 'volumen',
    ],
    required: { projekt: true, kunde_firma: true },
    messages: {
      projekt: 'Bitte die Projekt- bzw. Produktbezeichnung eingeben.',
      kunde_firma: 'Bitte die Firma eingeben.',
    },
    autoComplete: true,
  });

  const submit = useJourneySubmit(
    port as NonNullable<typeof port>,
    [{
      key: 'anfrage',
      entity: 'angebotsanfragen',
      form: anfrage,
      primary: true,
    }],
    { draftKey: 'angebotsanfrage-einreichen' },
  );

  if (loading || !cfg || !page || !port) {
    return <PublicShell loading={loading} unavailable={!loading} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anfrage.validate()) return;
    await submit.run();
  };

  if (submit.result) {
    return (
      <PublicShell title={page.title} description={page.description} wide>
        <SuccessStep
          result={submit.result}
          title={tx('Danke für deine Anfrage!')}
          whatHappensNext={tx('Wir haben deine Angebotsanfrage erhalten und melden uns bei dir. Bitte halte die Referenz für Rückfragen bereit.')}
          actions={{ copy: true, print: false }}
        />
      </PublicShell>
    );
  }

  return (
    <PublicShell title={page.title} description={page.description} wide>
      <form
        className="space-y-5"
        onSubmit={handleSubmit}
        onFocus={() => prepareChallenge(cfg, page, 'POST', `/apps/${page.endpoints?.find(ep => ep.op === 'create')?.app_id}/records`)}
        noValidate
      >
        <Bound form={anfrage} name="projekt" />
        <Bound form={anfrage} name="kunde_firma" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Bound form={anfrage} name="kunde_vorname" />
          <Bound form={anfrage} name="kunde_nachname" />
        </div>
        <Bound form={anfrage} name="beschreibung" rows={4} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Bound form={anfrage} name="angebotstermin" />
          <Bound form={anfrage} name="volumen" />
        </div>
        <FieldErrorSummary forms={[anfrage]} />
        {submit.error && (
          <p role="alert" className="text-sm text-destructive">
            {tx('Das Absenden hat leider nicht geklappt. Bitte versuche es noch einmal.')}
          </p>
        )}
        <Button type="submit" disabled={submit.submitting} className="w-full sm:w-auto">
          {submit.submitting ? tx('Wird gesendet …') : tx('Anfrage absenden')}
        </Button>
      </form>
    </PublicShell>
  );
}
