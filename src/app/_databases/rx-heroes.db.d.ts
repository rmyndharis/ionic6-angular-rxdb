/**
 * custom typings so typescript knows about the schema-fields
 */
import { RxHeroDocumentType } from '../_schemas/hero.schema';

import type { RxDocument, RxCollection, RxDatabase } from 'rxdb';
// ORM methods
type RxHeroDocMethods = {
  hpPercent(): number;
};

export type RxHeroDocument = RxDocument<RxHeroDocumentType, RxHeroDocMethods>;

export type RxHeroCollection = RxCollection<
  RxHeroDocumentType,
  RxHeroDocMethods,
  // eslint-disable-next-line @typescript-eslint/ban-types
  {}
>;

export type RxHeroesCollections = {
  hero: RxHeroCollection;
};

export type RxHeroesDatabase = RxDatabase<RxHeroesCollections>;
