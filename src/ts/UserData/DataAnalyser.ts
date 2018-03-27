import { Database } from "./Database";


export class DataAnalyser {
  // The database to analyse
  private database: Database;

  constructor (database: Database) {
    this.database = database;
  }

  // Compute and return an analysis of item clicks
  analyseItemClicks () {
    // Get the item click data
    let itemClickData = this.database.getTableEntries("item-clicks");

    // Initialize the analysis object
    let analysis = {
      totalNbClicks: itemClickData.length,
      menus: []
    };

    // Create required fields and count clicks with different granularities

    // Helper function checking if all fields related ton an item ID are available or not
    // If some are missing, they are added and initialized
    function createAllFieldsIfRequired (IDs, pathname: string) {
      function createFieldIfRequired (object, key, newFieldKey?, newFieldValue = {}) {
        if (object[key] === undefined) {
          object[key] = { nbClicks: 0, clickFrequency: 0 };
          if (newFieldKey) {
            object[key][newFieldKey] = newFieldValue;
          }
        }
      }

      createFieldIfRequired(analysis.menus, IDs.menu, "groups");
      createFieldIfRequired(analysis.menus[IDs.menu].groups, IDs.group, "items");
      createFieldIfRequired(analysis.menus[IDs.menu].groups[IDs.group].items, IDs.item, "nbClicksByPathname", new Map());

      if (! analysis.menus[IDs.menu].groups[IDs.group].items[IDs.item].nbClicksByPathname.has(pathname)) {
        analysis.menus[IDs.menu].groups[IDs.group].items[IDs.item].nbClicksByPathname.set(pathname, 0);
      }
    }

    // Iterate over all item clicks and update the analysis
    function processClick (IDs, pathname: string) {
      let menu = analysis.menus[IDs.menu];

      // Count a click
      menu.nbClicks += 1;
      menu.groups[IDs.group].nbClicks += 1;
      menu.groups[IDs.group].items[IDs.item].nbClicks += 1;

      // Add the source pathname to the set
      let currentNbClicksFromPathname = menu.groups[IDs.group].items[IDs.item].nbClicksByPathname.get(pathname);
      menu.groups[IDs.group].items[IDs.item].nbClicksByPathname.set(pathname, currentNbClicksFromPathname + 1);
    }

    for (let itemClick of itemClickData) {
      let IDs = itemClick["IDs"];
      let pathname: string = itemClick["pathname"];

      createAllFieldsIfRequired(IDs, pathname);
      processClick(IDs, pathname);
    }

    // Iterate again to compute frequencies
    function computeFrequencies (IDs) {
      analysis.menus[IDs.menu].clickFrequency =
          analysis.menus[IDs.menu].nbClicks
        / analysis.totalNbClicks;

      analysis.menus[IDs.menu].groups[IDs.group].clickFrequency =
          analysis.menus[IDs.menu].groups[IDs.group].nbClicks
        / analysis.menus[IDs.menu].nbClicks;

      analysis.menus[IDs.menu].groups[IDs.group].items[IDs.item].clickFrequency =
          analysis.menus[IDs.menu].groups[IDs.group].items[IDs.item].nbClicks
        / analysis.menus[IDs.menu].groups[IDs.group].nbClicks;
    }

    for (let itemClick of itemClickData) {
      let IDs = itemClick["IDs"];

      computeFrequencies(IDs);
    }

    return analysis;
  }


  // Compute and return an analysis of the page visits
  analysePageVisits () {
    // Get the page visits data
    let pageVisitsData = this.database.getTableEntries("page-visits");

    // Initialize the analysis object
    let analysis = {
      totalNbVisits: pageVisitsData.length,
      totalNbUniqueVisits: 0,
      nbVisits: new Map(),
      visitFrequencies: new Map()
    };

    // Compute/update the frequency and number of visits of each page
    function updateNbVisits (visit: object) {
      let pathname = visit["pathname"];

      let nbVisits = 0;
      if (analysis.nbVisits.has(pathname)) {
        nbVisits = analysis.nbVisits.get(pathname);
      }
      else {
        // If the pathname has never been seen before, increase the nb of unique visits
        analysis.totalNbUniqueVisits += 1;
      }

      analysis.nbVisits.set(pathname, nbVisits + 1);
    }

    function computeFrequency (nbVisits: number, pathname: string) {
      let frequency = nbVisits / analysis.totalNbVisits;
      analysis.visitFrequencies.set(pathname, frequency);
    }

    pageVisitsData.forEach(updateNbVisits);
    analysis.nbVisits.forEach(computeFrequency);

    return analysis;
  }
}
