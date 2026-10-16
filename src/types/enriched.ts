import type { Angebotsanfragen, Klaerpunkte } from './app';

export type EnrichedAngebotsanfragen = Angebotsanfragen & {
  federfuehrender_bereichName: string;
};

export type EnrichedKlaerpunkte = Klaerpunkte & {
  anfrageName: string;
  geschaeftsbereichName: string;
};
