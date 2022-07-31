/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { Injectable } from '@angular/core';
import { addRxPlugin, createRxDatabase } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { addPouchPlugin, getRxStoragePouch } from 'rxdb/plugins/pouchdb';
import { RxDBReplicationCouchDBPlugin } from 'rxdb/plugins/replication-couchdb';
import { RxDBValidatePlugin } from 'rxdb/plugins/validate';

import { RxHeroDocument, RxHeroesCollections, RxHeroesDatabase } from '../_databases/rx-heroes.db';
import { HERO_SCHEMA, RxHeroDocumentType } from '../_schemas/hero.schema';
import { environment } from './../../environments/environment.prod';

addRxPlugin(RxDBValidatePlugin);
addRxPlugin(RxDBDevModePlugin);

// import typings
const COUCHDB_PORT = environment.COUCHDB_PORT;
const HERO_COLLECTION_NAME = environment.HERO_COLLECTION_NAME;
const DATABASE_NAME = environment.DATABASE_NAME;
const IS_SERVER_SIDE_RENDERING = environment.IS_SERVER_SIDE_RENDERING;
const collectionSettings = {
  [HERO_COLLECTION_NAME]: {
    schema: HERO_SCHEMA,
    methods: {
      hpPercent(this: RxHeroDocument): number {
        return (this.hp / this.maxHP) * 100;
      },
    },
    sync: true,
  },
};

const syncHost = IS_SERVER_SIDE_RENDERING
  ? 'localhost'
  : window.location.hostname;
const syncURL = 'http://' + syncHost + ':' + COUCHDB_PORT + '/' + DATABASE_NAME;
console.log('syncURL: ' + syncURL);

function doSync(): boolean {
  if (IS_SERVER_SIDE_RENDERING) {
    return true;
  }

  if (global.window.location.hash === '#nosync') {
    return false;
  }
  return true;
}

/**
 * Loads RxDB plugins
 */
async function loadRxDBPlugins(): Promise<void> {
  addRxPlugin(RxDBReplicationCouchDBPlugin);
  // http-adapter is always needed for replication with the node-server
  // addPouchPlugin(PouchdbAdapterHttp);
  addPouchPlugin(require('pouchdb-adapter-http'));

  if (IS_SERVER_SIDE_RENDERING) {
    // for server side rendering, import the memory adapter
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const PouchdbAdapterMemory = require('pouchdb-adapter-' + 'memory');
    addPouchPlugin(PouchdbAdapterMemory);
  } else {
    // else, use indexeddb
    // addPouchPlugin(PouchdbAdapterIdb);
    addPouchPlugin(require('pouchdb-adapter-idb'));

    // then we also need the leader election
    addRxPlugin(RxDBLeaderElectionPlugin);
  }

  /**
   * to reduce the build-size,
   * we use some modules in dev-mode only
   */
  // if (isDevMode() && !IS_SERVER_SIDE_RENDERING) {
  //   await Promise.all([
  //     // add dev-mode plugin
  //     // which does many checks and add full error-messages
  //     import('rxdb/plugins/dev-mode').then((module) =>
  //       addRxPlugin(module as any)
  //     ),

  //     // we use the schema-validation only in dev-mode
  //     // this validates each document if it is matching the jsonschema
  //     import('rxdb/plugins/validate').then((module) =>
  //       addRxPlugin(module as any)
  //     ),
  //   ]);
  // }
}

/**
 * creates the database
 */
async function _create(): Promise<RxHeroesDatabase> {
  await loadRxDBPlugins();

  console.log('DatabaseService: creating database..');
  const db = await createRxDatabase<RxHeroesCollections>({
    name: DATABASE_NAME,
    storage: getRxStoragePouch(IS_SERVER_SIDE_RENDERING ? 'memory' : 'idb'),
    multiInstance: !IS_SERVER_SIDE_RENDERING,
    // password: 'myLongAndStupidPassword' // no password needed
  });
  console.log('DatabaseService: created database');

  // write to window for debugging
  (window as any).db = db;

  // show leadership in title

  db.waitForLeadership().then(() => {
    console.log('isLeader now');
    document.title = `♛ ${document.title}`;
  });

  // create collections
  console.log('DatabaseService: create collections');
  await db.addCollections(collectionSettings);

  // hooks
  console.log('DatabaseService: add hooks');
  db.collections.hero.preInsert((docObj: RxHeroDocumentType) => {
    const color = docObj.color;
    return db.collections.hero
      .findOne({
        selector: {
          color,
        },
      })
      .exec()
      .then((has: RxHeroDocument | null) => {
        if (has != null) {
          alert('another hero already has the color ' + color);
          throw new Error('color already there');
        }
        return db;
      });
  }, false);

  // sync with server
  if (doSync()) {
    console.log('DatabaseService: sync');
    const collectionUrl = syncURL + '/' + HERO_COLLECTION_NAME;

    if (IS_SERVER_SIDE_RENDERING) {
      /**
       * For server side rendering,
       * we just run a one-time replication to ensure the client has the same data as the server.
       */
      console.log(
        'DatabaseService: await initial replication to ensure SSR has all data'
      );
      const firstReplication = await db.hero.syncCouchDB({
        remote: collectionUrl,
        options: {
          live: false,
        },
      });
      await firstReplication.awaitInitialReplication();
    }

    /**
     * we start a live replication which also sync the ongoing changes
     */
    await db.hero.syncCouchDB({
      remote: collectionUrl,
      options: {
        live: true,
      },
    });
  }

  console.log('DatabaseService: created');

  return db;
}

let initState: null | Promise<any> = null;
let DB_INSTANCE: RxHeroesDatabase;

/**
 * This is run via APP_INITIALIZER in app.module.ts
 * to ensure the database exists before the angular-app starts up
 */
export async function initDatabase() {
  /**
   * When server side rendering is used,
   * The database might already be there
   */
  if (!initState) {
    console.log('initDatabase()');
    initState = _create().then((db) => (DB_INSTANCE = db));
  }
  await initState;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor() {}
  get db(): RxHeroesDatabase {
    return DB_INSTANCE;
  }
}
