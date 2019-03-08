/** @module user-data */

import * as $ from "jquery";
import { Utilities } from "../Utilities";
import { ItemClickLog, PageVisitLog } from "./DataLogger";
import { ItemCharacteristics } from "../adaptations/styles/composites/ProgressiveHighlightAndReorderItems";


/**
 * Type of a database _revision_, i.e. a version of its content.
 * 
 * It is used to keep track of certain changes in the database,
 * mostly for caching purposes (in other modules relying on the database content).
 */
export type DatabaseRevision = number;

/**
 * Type of the index of an entry in a database table.
 * 
 * It can be used to identify an entry in a given table,
 * as well as to compare the order in which two events have been recorded
 * (e.g. to compute primacy or recency scores).
 */
export type TableEntryIndex = number;

/**
 * Type of an entry in a database table.
 * 
 * The `index` field contains the index of the entry in the table (see [[TableEntryIndex]]),
 * which is automatically incremented for each new entry.
 * 
 * It must be parametrised by the type of data [[T]] the entry contains,
 * which must be an object (which must **not** have an `index` field).
 */
export type TableEntry<T extends {}> = T & {
  readonly index: TableEntryIndex;
};

/**
 * Interface of a database table.
 * 
 * It contains a list of indexed entries, as well as the current index
 * (equal to the index of the last added entry).
 * 
 * It must be parametrised by the type of data [[T]] of the table entries,
 * (see type parameter of [[TableEntry]]).
 */
interface DatabaseTable<T extends {}> {
  currentIndex: TableEntryIndex;
  entries: TableEntry<T>[];
}

/**
 * Interface of the persistent storage object of the database.
 * 
 * This object should contain properties whose values can be
 * freely updated by other modules of SAM, without any revision mechanism.
 * 
 * The database only takes care of saving and loading its content
 * accross page changes.
 */
export interface PersistentStorage {
  styleName?: string;
  policyName?: string;
  previousItemCharacteristics?: {[itemID: string]: ItemCharacteristics};
}


export class Database {

  // ============================================================ PROPERTIES ===

  /** Local storage key used to save the serialized database content. */
  static readonly LOCAL_STORAGE_KEY: string = "sam-data";

  /**
   * Tables of the database.
   * The keys are the table names,
   * and  the values are the related [[DatabaseTable]] objects.
   */
  private tables: {
    itemClicks: DatabaseTable<ItemClickLog>,
    pageVisits: DatabaseTable<PageVisitLog>
  };

  /**
   * Persistent storage of the database.
   * It is automatically saved and loaded by the database,
   * but is publicly exposed and provide no special feature like revisions.
   */
  persistentStorage: PersistentStorage;

  /**
   * Current revision of the database.
   * Incremented at every change in a table.
   */
  private currentRevision: DatabaseRevision;


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of Database.
   */
  constructor () {
    this.init();
    this.startListeningForPageUnload();

    console.log("Database loaded:", this);
  }


  // =============================================================== METHODS ===


  // ===========================================================================
  // Init/reset
  // ===========================================================================

  /**
   * Initializes the database and its content.
   *
   * Even a partial save can be loaded: the related fields are updated with
   * the loaded content (see [[loadFromLocalStorage]]), while the others
   * are set to default values (see [[setContentToDefault]]).
   *
   */
  private init () {
    this.setContentToDefault();

    if (this.isLocalStorageDataAvailable()) {
      this.loadFromLocalStorage();
    }
  }

  /**
   * Set or reset the database content to default values (empty content).
   *
   * Note: this does not affect any data stored in the local storage.
   */
  private setContentToDefault () {
    // Database content
    this.tables = {
      itemClicks: {
        currentIndex: 0,
        entries: []
      },

      pageVisits: {
        currentIndex: 0,
        entries: []
      }
    };

    this.persistentStorage = {};

    // Database internal properties
    this.currentRevision = 0;
  }

  /**
   * Empty the database content (set to default values),
   * and clear all data saved in the local storage.
   *
   * @return [description]
   */
  empty () {
    this.setContentToDefault();
    this.clearLocalStorageData();
  }


  // ===========================================================================
  // Revision
  // ===========================================================================

  /**
   * Get the current revision of the database.
   *
   * @return The current revision of the database.
   */
  getCurrentRevision (): DatabaseRevision {
    return this.currentRevision;
  }

  /**
   * Test whether the given revision is equal to the current one.
   *
   * @param  revision The revision to compare to the current one.
   * @return          `true` if the two revisions are equal, `false` otherwise.
   */
  isRevisionUpToDate (revision: DatabaseRevision): boolean {
    return this.currentRevision === revision;
  }


  // ===========================================================================
  // Item click logging
  // ===========================================================================

  /**
   * Get all item click logs stored in the database.
   *
   * @return A readonly array of all item click logs (as table entries).
   */
  getItemClickLogs (): ReadonlyArray<TableEntry<ItemClickLog>> {
    return this.tables.itemClicks.entries;
  }

  /**
   * Get the index where the next item click log would be inserted in the table.
   *
   * Note: this is also equal to the number of item click log entries.
   *
   * @return The index of the next item click log entry.
   */
  getItemClickLogsCurrentIndex (): TableEntryIndex {
    return this.tables.itemClicks.currentIndex;
  }

  /**
   * Save the given item click log in the dedicated database table.
   *
   * @param  log The item click log to save.
   * @return     The new revision of the database.
   */
  logItemClick (log: ItemClickLog): DatabaseRevision {
    let newEntry = Object.assign(log, {
      index: this.tables.itemClicks.currentIndex
    });

    this.tables.itemClicks.entries.push(newEntry);
    this.tables.itemClicks.currentIndex += 1;

    this.currentRevision += 1;
    return this.currentRevision;
  }


  // ===========================================================================
  // Page visit logging
  // ===========================================================================

  /**
   * Get all page visit logs stored in the database.
   *
   * @return A readonly array of all page visit logs (as table entries).
   */
  getPageVisitLogs (): ReadonlyArray<TableEntry<PageVisitLog>> {
    return this.tables.pageVisits.entries;
  }

  /**
   * Get the index where the next page visit log would be inserted in the table.
   *
   * Note: this is also equal to the number of page visit log entries.
   *
   * @return The index of the next page visit log entry.
   */
  getPageVisitLogsCurrentIndex (): TableEntryIndex {
    return this.tables.pageVisits.currentIndex;
  }

  /**
   * Save the given page visit log in the dedicated database table.
   *
   * @param  log The page visit log to save.
   * @return     The new revision of the database.
   */
  logPageVisit (log: PageVisitLog): DatabaseRevision {
    let newEntry = Object.assign(log, {
      index: this.tables.pageVisits.currentIndex
    });

    this.tables.pageVisits.entries.push(newEntry);
    this.tables.pageVisits.currentIndex += 1;

    this.currentRevision += 1;
    return this.currentRevision;
  }


  // ===========================================================================
  // Local storage management & saving/loading
  // ===========================================================================

  /**
   * Group all the data to save, and serialize it as a single JSON string.
   *
   * Note: the data must be natively compatible with JSON serialization,
   *       using `JSON.stringify` (e.g. it does not work with `Map`s).
   *
   * @return A JSON string representing the serialized data.
   */
  private packDataToJSON (): string {
    let packedData = {
      tables: this.tables,
      persistentStorage: this.persistentStorage,
      currentRevision: this.currentRevision
    };

    return JSON.stringify(packedData);
  }

  /**
  * Unserialize the given JSON string, which must represent grouped data
  * (according to [[packDataToJSON]] protocol), and update all internal fields
  * for which some data is available (i.e. non-undefined values).
  *    *
   * @param  json A JSON string representing the serialized data.
   */
  private unpackDataFromJSON (json: string) {
    let unpackedData = JSON.parse(json);

    function getFirstValueIfDefined (value1, value2) {
      return value1 !== undefined ? value1 : value2;
    }

    this.tables = getFirstValueIfDefined(unpackedData.tables, this.tables);
    this.persistentStorage = getFirstValueIfDefined(unpackedData.persistentStorage, this.persistentStorage);
    this.currentRevision = getFirstValueIfDefined(unpackedData.currentRevision, this.currentRevision);
  }

  /**
   * Test whether some database data is available in the local storage.
   *
   * @return `true` if the local storage is available and the value for key
   *         [[Database.LOCAL_STORAGE_KEY]] is not `null`, `false` otherwise.
   */
  isLocalStorageDataAvailable (): boolean {
    return Utilities.isLocalStorageAvailable()
        && window.localStorage.getItem(Database.LOCAL_STORAGE_KEY) !== null;
  }

  // Save the database data in the local storage
  // If the local storage is not available, an error is printed in the console and nothing happens

  /**
   * Group and serialize the database data into a JSON description (see [[packDataToJSON]]),
   * and save it in the local storage.
   *
   * Note: if the local storage is not available, nothing happen.
   */
  private saveInLocalStorage () {
    if (! Utilities.isLocalStorageAvailable()) {
      return;
    }

    let packedDataAsJSON = this.packDataToJSON();
    window.localStorage.setItem(Database.LOCAL_STORAGE_KEY, packedDataAsJSON);
  }

  /**
   * Load a JSON description database data from the local storage, unserialize it,
   * and update internal fields with available data (see [[unpackDataFromJSON]]).
   *
   * Note: if the local storage is not available, nothing happen.
   */
  private loadFromLocalStorage () {
    if (! Utilities.isLocalStorageAvailable()) {
      return;
    }

    let packedDataAsJSON = window.localStorage.getItem(Database.LOCAL_STORAGE_KEY);
    this.unpackDataFromJSON(packedDataAsJSON);
  }

  /**
   * Clear any local storage field holding database data.
   *
   * Note: if the local storage is not available, nothing happen.
   */
  private clearLocalStorageData () {
    if (! Utilities.isLocalStorageAvailable()) {
      return;
    }

    window.localStorage.removeItem(Database.LOCAL_STORAGE_KEY);
  }


  // ===========================================================================
  // Page unload handling
  // ===========================================================================

  /**
   * Start listening for page unload events.
   */
  private startListeningForPageUnload () {
    $(window).on("unload", (_) => {
      this.onPageUnload();
    });
  }

  /**
   * Page unload callback: save the database content in the local storage.
   */
  private onPageUnload () {
    this.saveInLocalStorage();
  }
}
