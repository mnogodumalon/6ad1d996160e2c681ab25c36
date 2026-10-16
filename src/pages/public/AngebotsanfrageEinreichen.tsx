import { useEffect, useMemo, useState } from 'react';
import { PublicShell } from '@/components/PublicShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChoiceGroup } from '@/components/blocks/ChoiceGroup';
import { Bound } from '@/components/blocks/Bound';
import { FieldErrorSummary } from '@/components/blocks/FieldErrorSummary';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { useStepForm, useJourneySubmit, makeReference } from '@/lib/journey';
import { createPublicPort } from '@/lib/journey/publicPort';
import {
  loadPublicPagesConfig, prepareChallenge,
  type PublicPagesConfig, type PublicPageConfig,
} from '@/lib/publicClient';
import { tx } from '@/i18n';

const SLUG = 'angebotsanfrage-einreichen';

type DocWay = 'link' | 'liste' | 'mail';

export default function AngebotsanfrageEinreichen() {
  const DOC_WAYS: Array<{ key: DocWay; label: string }> = [
  { key: 'link', label: tx('Link zum Dokument') },
  { key: 'liste', label: tx('Dokumente auflisten') },
  { key: 'mail', label: tx('Per E-Mail nachreichen') },
];

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

  const [docWay, setDocWay] = useState<DocWay | null>(null);
  const [docLink, setDocLink] = useState('');
  const [docList, setDocList] = useState('');

  const anfrage = useStepForm('angebotsanfragen', {
    fields: [
      'projekt', 'kunde_firma', 'kunde_vorname', 'kunde_nachname',
      'beschreibung', 'angebotstermin', 'volumen',
    ],
    required: { projekt: true, kunde_firma: true },
    messages: {
      projekt: tx('Bitte die Projekt- bzw. Produktbezeichnung eingeben.'),
      kunde_firma: tx('Bitte die Firma eingeben.'),
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
      values: () => {
        const base = String(anfrage.get('beschreibung') ?? '').trim();
        let note = '';
        if (docWay === 'link' && docLink.trim()) note = `${tx('Dokumente per Link')}: ${docLink.trim()}`;
        else if (docWay === 'liste' && docList.trim()) note = `${tx('Dokumente (Namen/Referenzen und Übermittlungsweg)')}:\n${docList.trim()}`;
        else if (docWay === 'mail') note = tx('Dokumente werden per E-Mail nachgereicht (Referenz: siehe Anfrage-Referenz).');
        return note ? { beschreibung: [base, note].filter(Boolean).join('\n\n') } : {};
      },
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
        >
          {docWay === 'mail' && (
            <p className="mt-4 rounded-md border p-3 text-sm">
              {tx`Sende deine Dokumente per E-Mail und nenne als Betreff diese Referenz: ${makeReference('angebotsanfragen', submit.result.primary.id)}`}
            </p>
          )}
        </SuccessStep>
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
        <fieldset className="space-y-3 rounded-md border p-4">
          <legend className="px-1 text-sm font-medium">{tx('Dokumente übergeben (optional)')}</legend>
          <p id="doc-way-label" className="text-sm text-muted-foreground">
            {tx('Hochladen ist hier nicht möglich. Wähle einen der drei Wege, um uns deine Unterlagen zu geben.')}
          </p>
          <ChoiceGroup
            id="doc-way"
            aria-labelledby="doc-way-label"
            value={docWay}
            onChange={k => setDocWay(k as DocWay | null)}
            options={DOC_WAYS}
            allowClear
          />
          {docWay === 'link' && (
            <div className="space-y-1.5">
              <Label htmlFor="doc-link">{tx('Link zu deinen Dokumenten (Cloud/Freigabe)')}</Label>
              <Input id="doc-link" type="url" inputMode="url" placeholder={tx('https://')} value={docLink} onChange={e => setDocLink(e.target.value)} />
            </div>
          )}
          {docWay === 'liste' && (
            <div className="space-y-1.5">
              <Label htmlFor="doc-list">{tx('Welche Dokumente gibt es und wie schickst du sie uns?')}</Label>
              <Textarea id="doc-list" rows={4} value={docList} onChange={e => setDocList(e.target.value)} />
            </div>
          )}
          {docWay === 'mail' && (
            <p className="text-sm">
              {tx('Nach dem Absenden zeigen wir dir eine Referenz. Nenne sie als Betreff, wenn du deine Dokumente per E-Mail schickst.')}
            </p>
          )}
        </fieldset>
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
