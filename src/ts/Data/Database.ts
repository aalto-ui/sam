import * as $ from "jquery";
import { Utilities } from "../Utilities";
import { ItemClickLog, PageVisitLog } from "./DataLogger";
import { ItemCharacteristics } from "../Adaptations/Techniques/ProgressiveHighlightAndReorderItems";


// Type of a database revision
// It is used to keep track of database updates, e.g. for caching purposes
export type DatabaseRevision = number;


// Type of an table entry index
// Every entry is given an index, automatically incremented for each type of event
export type TableEntryIndex = number;


// Generic type of a table entry
// It should be parametrized by the type of the data stored in the related table
// It contains an additional index, which should be unique in the related table
export type TableEntry<T extends {}> = T & {
  readonly index: TableEntryIndex;
};


// Generic interface of database table
// It should be parametrized by the type of the data stored in the related table
// It contains all its entries, as well as the current (last) index of the table
interface DatabaseTable<T extends {}> {
  currentIndex: TableEntryIndex;
  entries: TableEntry<T>[];
}


// Interface of a persistent storage object
// It should be used to store and load persistent data accross pages and sessions
export interface PersistentStorage {
  techniqueName?: string;
  policyName?: string;
  previousItemCharacteristics?: {[itemID: string]: ItemCharacteristics};
}


export class Database {
  // Local storage key
  private static readonly LOCAL_STORAGE_KEY: string = "awm-data";

  // Database tables (keys are their names)
  private tables: {
    itemClicks: DatabaseTable<ItemClickLog>,
    pageVisits: DatabaseTable<PageVisitLog>
  };

  // Persistent sotrage object
  // It is automatically saved on page leave and loaded on page load,
  // but provide no special feature (e.g. no revision system) and is public
  persistentStorage: PersistentStorage;

  // Current revision of the database
  private currentRevision : DatabaseRevision;


  constructor () {
    this.init();
    this.startListeningForPageUnload();

    console.log("Database loaded:", this);
  }

  // Initialize the database contentrom
  // It first init the content with default values,
  // and then replace it with anything that can be loaded from loca storage
  private init () {
    this.setContentToDefault();

    if (this.isLocalStorageDataAvailable()) {
      this.loadFromLocalStorage();
    }
  }

  // Reset the current database content to default values (or set it, if there is none)
  // Note: this does not affect any data stored in the local storage
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

  // Clear the current database and the local storage from any data,
  // and reset it to default
  empty () {
    this.setContentToDefault();
    this.clearLocalStorageData();
  }

  // Return the current revision of the database data
  getCurrentRevision () {
    return this.currentRevision;
  }

  // Return true if the given revision match the current one, false otherwise
  isRevisionUpToDate (revision: DatabaseRevision) {
    return this.currentRevision === revision;
  }

  getItemClickLogs (): ReadonlyArray<TableEntry<ItemClickLog>> {
    return this.tables.itemClicks.entries;
  }

  getItemClickLogsCurrentIndex (): TableEntryIndex {
    return this.tables.itemClicks.currentIndex;
  }

  logItemClick (log: ItemClickLog): DatabaseRevision {
    let newEntry = Object.assign(log, {
      index: this.tables.itemClicks.currentIndex
    });

    this.tables.itemClicks.entries.push(newEntry);
    this.tables.itemClicks.currentIndex += 1;

    this.currentRevision += 1;
    return this.currentRevision;
  }

  getPageVisitLogs (): ReadonlyArray<TableEntry<PageVisitLog>> {
    return this.tables.pageVisits.entries;
  }

  getPageVisitLogsCurrentIndex (): TableEntryIndex {
    return this.tables.pageVisits.currentIndex;
  }

  logPageVisit (log: PageVisitLog): DatabaseRevision {
    let newEntry = Object.assign(log, {
      index: this.tables.pageVisits.currentIndex
    });

    this.tables.pageVisits.entries.push(newEntry);
    this.tables.pageVisits.currentIndex += 1;

    this.currentRevision += 1;
    return this.currentRevision;
  }

  // Group all persistent data to save, and stringify it to JSON
  private packDataToJSON (): string {
    let packedData = {
      tables: this.tables,
      persistentStorage: this.persistentStorage,
      currentRevision: this.currentRevision
    };

    return JSON.stringify(packedData);
  }

  // Parse a JSON string representing packed data, and fill the database with it
  private unpackDataFromJSON (json: string) {
    let unpackedData = JSON.parse(json);

    function getFirstValueIfDefined (value1, value2) {
      return value1 !== undefined ? value1 : value2;
    }

    this.tables = getFirstValueIfDefined(unpackedData.tables ,this.tables);
    this.persistentStorage = getFirstValueIfDefined(unpackedData.persistentStorage ,this.persistentStorage);
    this.currentRevision = getFirstValueIfDefined(unpackedData.currentRevision ,this.currentRevision);
  }

  // Return true if database data si available in the local storage
  // Otherwise, or if the local storage is not available, return false
  isLocalStorageDataAvailable (): boolean {
    return Utilities.isLocalStorageAvailable()
        && window.localStorage.getItem(Database.LOCAL_STORAGE_KEY) !== null;
  }

  // Save the database data in the local storage
  // If the local storage is not available, an error is printed in the console and nothing happens
  private saveInLocalStorage () {
    if (! Utilities.isLocalStorageAvailable()) {
      return;
    }

    let packedDataAsJSON = this.packDataToJSON();
    window.localStorage.setItem(Database.LOCAL_STORAGE_KEY, packedDataAsJSON);
  }

  // Load the database data from the local storage
  // If the local storage is not available, an error is printed in the console and nothing happens
  private loadFromLocalStorage () {
    if (! Utilities.isLocalStorageAvailable()) {
      return;
    }

    let packedDataAsJSON = window.localStorage.getItem(Database.LOCAL_STORAGE_KEY);
    this.unpackDataFromJSON(packedDataAsJSON);
  }

  // Clear the local storage from database data (if any)
  private clearLocalStorageData () {
    if (! Utilities.isLocalStorageAvailable()) {
      return;
    }

    window.localStorage.removeItem(Database.LOCAL_STORAGE_KEY);
  }

  // Start listening for page unload events
  private startListeningForPageUnload () {
    $(window).on("unload", (_) => {
      this.onPageUnload();
    });
  }

  // Callback for page unload event
  // Automatically save the content of the page in the local storage
  private onPageUnload () {
    this.saveInLocalStorage();
  }
}
