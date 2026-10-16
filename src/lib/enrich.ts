import type { EnrichedAngebotsanfragen, EnrichedKlaerpunkte } from '@/types/enriched';
import type { Angebotsanfragen, Geschaeftsbereiche, Klaerpunkte } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface AngebotsanfragenMaps {
  geschaeftsbereicheMap: Map<string, Geschaeftsbereiche>;
}

export function enrichAngebotsanfragen(
  angebotsanfragen: Angebotsanfragen[],
  maps: AngebotsanfragenMaps
): EnrichedAngebotsanfragen[] {
  return angebotsanfragen.map(r => ({
    ...r,
    federfuehrender_bereichName: resolveDisplay(r.fields.federfuehrender_bereich, maps.geschaeftsbereicheMap, 'bezeichnung'),
  }));
}

interface KlaerpunkteMaps {
  angebotsanfragenMap: Map<string, Angebotsanfragen>;
  geschaeftsbereicheMap: Map<string, Geschaeftsbereiche>;
}

export function enrichKlaerpunkte(
  klaerpunkte: Klaerpunkte[],
  maps: KlaerpunkteMaps
): EnrichedKlaerpunkte[] {
  return klaerpunkte.map(r => ({
    ...r,
    anfrageName: resolveDisplay(r.fields.anfrage, maps.angebotsanfragenMap, 'anfragenummer'),
    geschaeftsbereichName: resolveDisplay(r.fields.geschaeftsbereich, maps.geschaeftsbereicheMap, 'bezeichnung'),
  }));
}
