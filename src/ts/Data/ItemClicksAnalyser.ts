import { Database } from "./Database";
import { Utilities } from "../Utilities";
import { DataAnalyserModule } from "./DataAnalyserModule";
import { Analysis } from "./DataAnalyser";


// Internal interfaces implemented by different level of the 'hierarchical stats' object,
// provoding multi-granularities stats (menus, groups and items)
interface AdaptiveElementStats {
  nbClicks: number,
  nbLocalClicks: number,
  clickFrequency: number,
  localClickFrequency: number
}

interface ItemStats extends AdaptiveElementStats {
  nbClicksByPathname: {[key: string]: number}
}

interface ItemGroupStats extends AdaptiveElementStats {
  items: {[key: string]: ItemStats}
}

interface MenuStats extends AdaptiveElementStats {
  groups: {[key: string]: ItemGroupStats}
}


// Interface implemented by the item clicks analysis returned by this module
export interface ItemClicksAnalysis extends Analysis {
  totalNbClicks: number,
  totalLocalNbClicks: number,
  itemsNbClicks: {[key: string]: number},
  itemsClickFrequencies: {[key: string]: number},
  menus: {[key: string]: MenuStats}
}


export class ItemClicksAnalyser extends DataAnalyserModule {
  constructor (database: Database) {
    super(database);
  }

  protected computeAnalysis (): ItemClicksAnalysis {
    // Get the data
    let itemClickData = this.database.getTableEntries("item-clicks");
    let itemNbClicksData = this.database.getTableEntries("item-nb-clicks");

    let currentPagePathname = window.location.pathname;

    // Initialize the analysis object
    let analysis = {
      totalNbClicks: itemClickData.length,
      totalLocalNbClicks: 0,
      itemsNbClicks: {},
      itemsClickFrequencies: {},
      menus: {}
    };

    // Set up the items nb clicks and frequency
    for (let itemData of itemNbClicksData) {
      let itemID = itemData["IDs"]["item"];
      let itemNbClicks = itemData["nbClicks"];

      analysis.itemsNbClicks[itemID] = itemNbClicks;
      analysis.itemsClickFrequencies[itemID] = itemNbClicks / analysis.totalNbClicks;
    }

    // Create required fields and count clicks with different granularities

    // Helper function checking if all fields related ton an item ID are available or not
    // If some are missing, they are added and initialized
    function createAllFieldsIfRequired (IDs, pathname: string) {
      function createFieldIfRequired (object, key, newFieldKey?, newFieldValue = {}) {
        if (object[key] === undefined) {
          object[key] = {
            nbClicks: 0,
            nbLocalClicks: 0,
            clickFrequency: 0,
            localClickFrequency: 0
          };
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

      if (Utilities.linkEndsWithPathname(pathname, currentPagePathname)) {
        analysis.totalLocalNbClicks += 1;
        menu.localNbClicks += 1;
        menu.groups[IDs.group].localNbClicks += 1;
        menu.groups[IDs.group].items[IDs.item].localNbClicks += 1;
      }

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
    function computeGlobalFrequencies (IDs) {
      if (analysis.totalNbClicks !== 0) {
        analysis.menus[IDs.menu].clickFrequency =
            analysis.menus[IDs.menu].nbClicks
          / analysis.totalNbClicks;
      }

      if (analysis.menus[IDs.menu].nbClicks !== 0) {
        analysis.menus[IDs.menu].groups[IDs.group].clickFrequency =
            analysis.menus[IDs.menu].groups[IDs.group].nbClicks
          / analysis.menus[IDs.menu].nbClicks;
      }

      if (analysis.menus[IDs.menu].groups[IDs.group].nbClicks !== 0) {
        analysis.menus[IDs.menu].groups[IDs.group].items[IDs.item].clickFrequency =
            analysis.menus[IDs.menu].groups[IDs.group].items[IDs.item].nbClicks
          / analysis.menus[IDs.menu].groups[IDs.group].nbClicks;
      }
    }

    function computeLocalFrequencies (IDs) {
      if (analysis.totalLocalNbClicks !== 0) {
        analysis.menus[IDs.menu].localClickFrequency =
            analysis.menus[IDs.menu].localNbClicks
          / analysis.totalLocalNbClicks;
      }

      if (analysis.menus[IDs.menu].localNbClicks !== 0) {
        analysis.menus[IDs.menu].groups[IDs.group].localClickFrequency =
            analysis.menus[IDs.menu].groups[IDs.group].localNbClicks
          / analysis.menus[IDs.menu].localNbClicks;
      }

      if (analysis.menus[IDs.menu].groups[IDs.group].localNbClicks !== 0) {
        analysis.menus[IDs.menu].groups[IDs.group].items[IDs.item].localClickFrequency =
            analysis.menus[IDs.menu].groups[IDs.group].items[IDs.item].localNbClicks
          / analysis.menus[IDs.menu].groups[IDs.group].localNbClicks;
      }
    }

    for (let itemClick of itemClickData) {
      let IDs = itemClick["IDs"];

      computeGlobalFrequencies(IDs);
      computeLocalFrequencies(IDs);
    }

    return <any> analysis;
  }

}
