import { Database } from "./Database";
import { ItemID } from "../Menus/Item";
import { GroupID } from "../Menus/ItemGroup";
import { MenuID } from "../Menus/Menu";


// Note: types not relevant anymore?
//
// // Interfaces for the proposed analysis output objects
// // They should be treated as references for what this module can provide!
// interface DataAnalysis {}
//
// interface ItemClickAnalysis extends DataAnalysis {
//   totalNbClicks: number,
//   menus: {
//     nbClicks: number,
//     clickFrequency: number,
//     groups: menus: {
//       nbClicks: number,
//       clickFrequency: number,
//       items:
//     }
//   }
// }
//
// interface PageVisitsAnalysis extends DataAnalysis {
//   nbVisits: Map<string, number>,
//   visitFrequency: Map<string, number>
// }


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
    function createAllFieldsIfRequired (id: ItemID) {
      function createFieldIfRequired (object, field, objectProp?) {
        if (object[field] === undefined) {
          object[field] = { nbClicks: 0, clickFrequency: 0 };
          if (objectProp) {
            object[field][objectProp] = {};
          }
        }
      }

      createFieldIfRequired(analysis.menus, id.menuPos, "groups");
      createFieldIfRequired(analysis.menus[id.menuPos].groups, id.groupPos, "items");
      createFieldIfRequired(analysis.menus[id.menuPos].groups[id.groupPos].items, id.itemPos);
    }

    // Iterate over all item clicks and update the analysis
    function countClick (id: ItemID) {
      analysis.menus[id.menuPos].nbClicks += 1;
      analysis.menus[id.menuPos].groups[id.groupPos].nbClicks += 1;
      analysis.menus[id.menuPos].groups[id.groupPos].items[id.itemPos].nbClicks += 1;
    }

    for (let itemClick of itemClickData) {
      let id: ItemID = itemClick["itemID"];

      createAllFieldsIfRequired(id);
      countClick(id);
    }

    // Iterate again to compute frequencies
    function computeFrequencies (id: ItemID) {
      analysis.menus[id.menuPos].clickFrequency =
          analysis.menus[id.menuPos].nbClicks
        / analysis.totalNbClicks;

      analysis.menus[id.menuPos].groups[id.groupPos].clickFrequency =
          analysis.menus[id.menuPos].groups[id.groupPos].nbClicks
        / analysis.menus[id.menuPos].nbClicks;

      analysis.menus[id.menuPos].groups[id.groupPos].items[id.itemPos].clickFrequency =
          analysis.menus[id.menuPos].groups[id.groupPos].items[id.itemPos].nbClicks
        / analysis.menus[id.menuPos].groups[id.groupPos].nbClicks;
    }

    for (let itemClick of itemClickData) {
      let id: ItemID = itemClick["itemID"];

      computeFrequencies(id);
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
