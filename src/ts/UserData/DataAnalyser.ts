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

    // Initialize the analysis object with IDs and immediate values
    let analysis = {
      totalNbClicks: 0
    };

    // Set immediately available constants
    analysis.totalNbClicks = itemClickData.length;

    // Create required fields and count clicks with different granularities

    // Helper function checking if all fields related ton an item ID are available or not
    // If some are missing, they are added and initialized
    function createAllFieldsIfRequired (id: ItemID) {
      function createFieldIfRequired (object, field) {
        if (object[field] === undefined) {
          object[field] = { nbClicks: 0, clickFrequency: 0 };
        }
      }

      createFieldIfRequired(analysis, id.menuPos);
      createFieldIfRequired(analysis[id.menuPos], id.groupPos);
      createFieldIfRequired(analysis[id.menuPos][id.groupPos], id.itemPos);
    }

    // Iterate over all item clicks and update the analysis
    function countClick (id: ItemID) {
      analysis[id.menuPos].nbClicks += 1;
      analysis[id.menuPos][id.groupPos].nbClicks += 1;
      analysis[id.menuPos][id.groupPos][id.itemPos].nbClicks += 1;
    }

    for (let itemClick of itemClickData) {
      let id: ItemID = itemClick["itemID"];

      createAllFieldsIfRequired(id);
      countClick(id);
    }

    // Iterate again to compute frequencies
    function computeFrequencies (id: ItemID) {
      analysis[id.menuPos].clickFrequency =
        analysis[id.menuPos].nbClicks / analysis.totalNbClicks;

      analysis[id.menuPos][id.groupPos].clickFrequency =
        analysis[id.menuPos][id.groupPos].nbClicks / analysis[id.menuPos].nbClicks;

      analysis[id.menuPos][id.groupPos][id.itemPos].clickFrequency =
        analysis[id.menuPos][id.groupPos][id.itemPos].nbClicks / analysis[id.menuPos][id.groupPos].nbClicks;
    }

    for (let itemClick of itemClickData) {
      let id: ItemID = itemClick["itemID"];

      computeFrequencies(id);
    }

    return analysis;
  }

  // Compute and return an analysis of the page visits
  analysePageVisits () {
    // TODO
  }
}
