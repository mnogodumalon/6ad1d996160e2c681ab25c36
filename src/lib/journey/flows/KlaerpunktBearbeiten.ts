/**
 * useKlaerpunktBearbeitenFlow — the plumbing of the flow « Klärpunkt beantworten », generated from the plan.
 *
 * Changes `klaerpunkte`: the record to change is picked (`flow.pick('klaerpunkte')`), the form is prefilled with its values; asks `antwort`, `auswirkung`, `status`, `bearbeiter_vorname`, `bearbeiter_nachname`.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 3)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useKlaerpunktBearbeitenFlow({
 *     steps: { klaerpunkte: 1, antwort: 2, auswirkung: 2, status: 2, bearbeiter_vorname: 2, bearbeiter_nachname: 2 },
 *     items: { klaerpunkte: r => ({ id: r.id, title: fieldText(r, 'titel') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.klaerpunkte.select} {...flow.pick('klaerpunkte')} />
 *     <Bound form={flow.forms.klaerpunkte} name="antwort" />
 *     <Bound form={flow.forms.klaerpunkte} name="auswirkung" />
 *     <Bound form={flow.forms.klaerpunkte} name="status" />
 *     <Bound form={flow.forms.klaerpunkte} name="bearbeiter_vorname" />
 *     <Bound form={flow.forms.klaerpunkte} name="bearbeiter_nachname" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import { useState } from 'react';
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
import { entityLabel } from '@/lib/journey/rules';
export type KlaerpunktBearbeitenFieldKey = 'antwort' | 'auswirkung' | 'bearbeiter_nachname' | 'bearbeiter_vorname' | 'klaerpunkte' | 'status';

export interface KlaerpunktBearbeitenForms {
  klaerpunkte: StepForm<'klaerpunkte'>;
}

// Alias so the option generics stay readable.
type Key = KlaerpunktBearbeitenFieldKey;

export interface KlaerpunktBearbeitenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    klaerpunkte?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"antwort": 2, "auswirkung": 2, "bearbeiter_nachname": 2, "bearbeiter_vorname": 2, "klaerpunkte": 1, "status": 2};
export const KLAERPUNKTBEARBEITEN_REVIEW_STEP = 3;

function fromPick<T>(pick: { recordOf(id: string): JourneyRecord | undefined }, form: StepForm, field: string, read: (r: JourneyRecord) => T): T | undefined {
  const id = form.get(field);
  const rec = typeof id === 'string' && id ? pick.recordOf(id) : undefined;
  return rec ? read(rec) : undefined;
}
function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns T, not Partial<T>: a Record's index signature is already "maybe
// absent", and Partial<Record<string, string>> does not assign to the
// Record<string, string> useStepForm wants (tsc, live 23.09.2026 — eight
// errors, one per hook, caught only in the sandbox build).
function only<T extends Record<string, unknown>>(obj: T | undefined, keys: string[]): T | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out as T;
}

function hasValues(form: StepForm): boolean {
  return form.keys.some(k => !isEmptyValue(form.values[k]));
}

export function useKlaerpunktBearbeitenFlow(options: KlaerpunktBearbeitenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const [klaerpunkteTargetId, setKlaerpunkteTargetId] = useState<string | null>(null);
  const klaerpunkte = useStepForm('klaerpunkte', {
    fields: ["antwort", "auswirkung", "status", "bearbeiter_vorname", "bearbeiter_nachname"],
    steps: only(steps, ["antwort", "auswirkung", "status", "bearbeiter_vorname", "bearbeiter_nachname"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["antwort", "auswirkung", "status", "bearbeiter_vorname", "bearbeiter_nachname"]),
    messages: only(options.messages as Record<string, string> | undefined, ["antwort", "auswirkung", "status", "bearbeiter_vorname", "bearbeiter_nachname"]),
  });
  const forms: KlaerpunktBearbeitenForms = { klaerpunkte };
  const formList: StepForm[] = [klaerpunkte];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    klaerpunkte: useRecordSearch(servicePort, 'klaerpunkte', withPickPolicy('klaerpunkte', {
      searchFields: ["titel", "frage"] as never,
      filter: "r.v_status in ['offen', 'in_bearbeitung', 'rueckfrage_kunde']",
      where: (r: JourneyRecord) => ["offen", "in_bearbeitung", "rueckfrage_kunde"].includes(fieldLookup(r, "status")?.key ?? ''),
      toItem: options.items?.klaerpunkte as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:klaerpunkt-bearbeiten:read:${entity}`);
  const picks = {
    klaerpunkte: { ...searches.klaerpunkte, select: { ...searches.klaerpunkte.select, create: false as boolean, hint: hintFor('klaerpunkte', 'klaerpunkte', {"conditions": [{"field": "status", "op": "in", "value": ["offen", "in_bearbeitung", "rueckfrage_kunde"]}], "mode": "all"} as PickWhere | null) } },
  };

  const plan: PlanStep[] = [
    {
      key: 'klaerpunkte', entity: 'klaerpunkte', form: klaerpunkte, primary: true,
      updates: () => klaerpunkteTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => klaerpunkteTargetId
        ? { key: 'target:klaerpunkte', label: entityLabel('klaerpunkte'), value: picks.klaerpunkte.labelOf(klaerpunkteTargetId) ?? klaerpunkteTargetId, step: steps.klaerpunkte }
        : undefined,    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'klaerpunkt-bearbeiten' });

  /** The record(s) this flow CHANGES: picked through {...flow.picks.<entity>.select} {...flow.pick('<entity>')};
   *  picking prefills the form with the record's current values, and the plan step updates that record. */
  const targets = {
    klaerpunkte: {
      selectedId: klaerpunkteTargetId,
      onSelect: (id: string) => {
        setKlaerpunkteTargetId(id);
        const rec = picks.klaerpunkte.recordOf(id);
        if (rec) klaerpunkte.reset({ antwort: fieldText(rec, "antwort"), auswirkung: fieldLookups(rec, "auswirkung").map(o => o.key), status: fieldLookup(rec, "status")?.key, bearbeiter_vorname: fieldText(rec, "bearbeiter_vorname"), bearbeiter_nachname: fieldText(rec, "bearbeiter_nachname"), });
      },
      get record(): JourneyRecord | undefined { return klaerpunkteTargetId ? picks.klaerpunkte.recordOf(klaerpunkteTargetId) : undefined; },
    },
  };
  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: KlaerpunktBearbeitenFieldKey) => {
    if (field in targets) {
      const t = targets[field as keyof typeof targets];
      return { selectedId: t.selectedId, onSelect: t.onSelect };
    }
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return {
      selectedId: (typeof owner.get(field) === 'string' ? (owner.get(field) as string) : null) || null,
      // `field as never` collapsed the conditional SetArgs<E, never> to never and
      // no argument was assignable any more (tsc, live 23.09.2026); widen `set`
      // itself instead — the label stays a required third argument.
      onSelect: (id: string) => (owner.set as (k: string, v: unknown, l?: string) => void)(field, id, search?.labelOf(id)),
    };
  };
  /** Props for a multi-record pick step: {...flow.picks.x.select} {...flow.pickMany('x')} */
  const pickMany = (field: KlaerpunktBearbeitenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)))    && Object.entries(targets).every(([k, t]) => steps[k] !== n || !!t.selectedId);
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); setKlaerpunkteTargetId(null); };

  return {
    slug: 'klaerpunkt-bearbeiten' as const,
    draftKey: 'klaerpunkt-bearbeiten' as const,
    entity: 'klaerpunkte' as const,
    form: klaerpunkte,
    forms, formList, picks, submit, steps, targets,    reviewStep: KLAERPUNKTBEARBEITEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type KlaerpunktBearbeitenFlow = ReturnType<typeof useKlaerpunktBearbeitenFlow>;
