import * as $ from "jquery";
import { ItemListPolicy } from "./ItemListPolicy";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";


export class SerialPositionCurvePolicy implements ItemListPolicy {
  // Maximum number of items to keep
  maxNbItems: number = 2;

  // If true, ignore the stats of the current page
  ignoreCurrentPage: boolean = false;


  constructor () { }


  getItemList (menus: Menu[], analyser: DataAnalyser): Item[] {
    let analysis = analyser.getPageVisitsAnalysis();

    let currentPagePathname = window.location.pathname;

    // Compute a familiarity score for each page, based on the serial position curve
    // The score computation rules are taken from the Familiariser [Todi et al. 18]
    let familiarityScores = new Map();

    // First filter out the current page pathname if required
    if (this.ignoreCurrentPage) {
      delete analysis.visitDurations[currentPagePathname];
    }

    for (let pathname in analysis.firstVisitTimestamps) {
      // Recency and primacy (note: lower values lead to higher score below!)
      let recency = 0;
      let primacy = 0;

      let lastVisitTimestamp = analysis.lastVisitTimestamps[pathname];
      let firstVisitTimestamp = analysis.firstVisitTimestamps[pathname];

      for (let p in analysis.lastVisitTimestamps) {
        if (analysis.lastVisitTimestamps[p] > lastVisitTimestamp) {
          recency++;
        }

        if (analysis.firstVisitTimestamps[p] < firstVisitTimestamp) {
          primacy++;
        }
      }

      // Intermediate scores used to compute the familiarity score
      let frequencyScore = analysis.visitFrequencies[pathname];
      let recencyScore = (analysis.nbUniquePathnames - recency) / analysis.nbUniquePathnames;
      let primacyScore = (analysis.nbUniquePathnames - primacy) / analysis.nbUniquePathnames;

      //console.log("Frequency score:", frequencyScore);
      //console.log("Recency score:", recencyScore);
      //console.log("Primacy score:", primacyScore);

      // Familiarity score
      let familiarity = (0.4 * frequencyScore)
                      + (0.4 * recencyScore)
                      + (0.2 * primacyScore);

      familiarityScores.set(pathname, familiarity);
    }

    // Sort pages by their familiarity scores
    let pagesSortedByFamiliarity = [...familiarityScores.entries()]
      .map(tuple => {
        return { pathname: tuple[0], familiarity: tuple[1] };
      })
      .sort((e1, e2) => {
        return e2.familiarity - e1.familiarity;
      });

    // Sort items according to the position of the pages pointed by their links
    // among previously ordered pages
    let items = Menu.getAllMenusItems(menus);

    let sortedItems = [];
    for (let page of pagesSortedByFamiliarity) {
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let matchingLinkNodes = item.findLinkNodes(page.pathname);

        if (matchingLinkNodes.length > 0) {
          items.splice(i, 1);
          sortedItems.push(item);
          break;
        }
      }
    }

    // Finally return the sorted items, followed by the remaining unsorted items
    return sortedItems.concat(items);
  }
}
