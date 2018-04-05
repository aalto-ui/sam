import * as $ from "jquery";


// Type of an entry, in any table of the database
type Entry = object;

// Type of a table, grouping related entries
// The table template is a simplified type used for default tables purposes
interface TableTemplate {
  name: string;
  template: Entry;
}

interface Table extends TableTemplate {
  entries: Entry[];
}

// Type of the root database data, containing all tables
type RootData = Map<string, Table>;


export class Database {
  // Stored data
  private data: RootData;

  // local storage key
  private static readonly LOCAL_STORAGE_KEY: string = "awm-user-data";

  // List of default tables (with names and templates)
  // This is used to initialize the database!
  private static readonly DEFAULT_TABLES: TableTemplate[] = [
    // Table for item clicks logs
    {
      name: "item-clicks",
      template: {
        timestamp: 0,
        pathname: "",
        IDs: {
          item: "",
          group: "",
          menu: ""
        }
      }
    },

    // Table for items nb clicks
    {
      name: "item-nb-clicks",
      template: {
        nbClicks: 0,
        IDs: {
          item: "",
          group: "",
          menu: ""
        }
      }
    },

    // Table for visited pages logs
    {
      name: "page-visits",
      template: {
        timestamp: 0,
        pathname: ""
      }
    },

    // Table for time spent on pages (in ms)
    {
      name: "page-visit-time",
      template: {
        pathname: "",
        timeSpent: 0
      }
    }
  ];

  // The callback method to use to save the database on page unload
  private pageUnloadCallback = (event) => { this.saveInLocalStorage(); };


  constructor () {
    this.loadFromLocalStorageOrInit();
    this.startSaveOnPageUnload();

    console.log("Database loaded:", this.data);
  }

  // Set up the default tables, only if they do not exist yet
  initWithDefaultTables () {
    if (! this.data) {
      this.data = new Map();
    }

    for (let defaultTable of Database.DEFAULT_TABLES) {
      if (! this.data.has(defaultTable.name)) {
        this.addTable(defaultTable.name, defaultTable.template);
      }
    }
  }

  // Attempt to create a new database table
  // Returns true on success, false if the name is already in use
  addTable (name: string, template?: Entry): boolean {
    if (this.data.has(name)) {
      return false;
    }

    this.data.set(name, {
      name: name,
      template: template,
      entries: []
    });

    return true;
  }

  // Remove the table with the given name from the database, and returns it
  // Returns undefined if it does not exist
  removeTable (name: string) {
    if (! this.data.has(name)) {
      return undefined;
    }

    let table = this.data.get(name);
    this.data.delete(name);

    return table;
  }

  // Return true if there is at least one entry in the table with the given name, passing the given test function
  // Otherwise, or if the table does not exist, return false
  hasTableEntry (name: string, test: (Entry) => boolean) {
    if (! this.data.has(name)) {
      return false;
    }

    return this.data.get(name).entries
      .some(test);
  }

  // Return the list of entries of a table with the given name, possibly filtered by the given test function
  // Returns undefined if the table does not exist
  getTableEntries (name: string, test: (Entry) => boolean = (_) => { return true; }): Entry[] {
    if (! this.data.has(name)) {
      return undefined;
    }

    let entries = this.data.get(name).entries;

    if (test) {
      return entries.filter(test);
    }

    return entries;
  }

  // Add an entry to the table with the given name
  // If format checks are activated, the entry format must match the format of the table template,
  // that is, own at least the same keys as the template entry
  // If there is no template in this table yet, this entry becomes the new template
  // Returns true on success, false if the table does not exist, or if the entry format is checked and wrong
  addTableEntry (name: string, entry: Entry, checkFormat: boolean = false): boolean {
    if (! this.data.has(name)) {
      return false;
    }

    let table = this.data.get(name);

    // Set the table template ifd there is none
    if (! table.template) {
      table.template = entry;
    }

    // Check the entry format according to the template if required
    else if (checkFormat) {
      for (let key in table.template) {
        if (! (key in entry)) {
          return false;
        }
      }
    }

    table.entries.push(entry);
    return true;
  }

  // Edit the entries of the table with the given name, optionnaly filtered with the given test function
  // The edit function is applied to every matching item, and must modify it in-place
  editTableEntries (name: string, edit: (Entry) => void, test?: (Entry) => boolean) {
    this.getTableEntries(name, test)
      .forEach(edit);
  }

  // If the local storage is available, returns true;
  // otherwise, print an error message in the console and return false
  private checkLocalStorageAvailability (): boolean {
    if (! window.localStorage) {
      console.error("Error: local storage is not available to the database");
      return false;
    }

    return true;
  }

  // Get a JSON representation of the database data
  static toJSON (data: RootData): string {
    // Make a regular object out of the data map object
    let preparedData = [...data];

    return JSON.stringify(preparedData);
  }

  // Get database data from a JSON representation
  static fromJSON (json: string): RootData {
    let rawData = JSON.parse(json);

    // Make a map out of the raw data
    return new Map(rawData);
  }

  // Save the database data in the local storage
  // If the local storage is not available, an error is printed in the console and nothing happens
  saveInLocalStorage () {
    if (! this.checkLocalStorageAvailability()) {
      return;
    }

    let dataAsJSON = Database.toJSON(this.data);
    let localStorageData = window.localStorage.setItem(Database.LOCAL_STORAGE_KEY, dataAsJSON);
  }

  // Load the database data from the local storage
  // If the local storage is not available, an error is printed in the console and nothing happens
  loadFromLocalStorage () {
    if (! this.checkLocalStorageAvailability()) {
      return;
    }

    let rawLoadedData = window.localStorage.getItem(Database.LOCAL_STORAGE_KEY);
    if (rawLoadedData !== null) {
      this.data = Database.fromJSON(rawLoadedData);
    }
  }

  // Load the database from the local storage
  // If the local storage is not available, an fresh default database is created instead
  loadFromLocalStorageOrInit () {
    let loadSuccess = this.loadFromLocalStorage();

    if (! loadSuccess) {
      this.initWithDefaultTables();
    }
  }

  // Start saving the database data in the local storage when the user leaves the page
  startSaveOnPageUnload () {
    $(window).on("unload", this.pageUnloadCallback);
  }

  // Stop saving the database data in the local storage when the user leaves the page
  stopSaveOnPageUnload () {
    $(window).off("unload", this.pageUnloadCallback);
  }
}
