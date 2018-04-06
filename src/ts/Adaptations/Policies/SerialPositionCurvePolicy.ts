import * as $ from "jquery";
import { ItemListPolicy } from "./ItemListPolicy";
import { Menu } from "../../Menus/Menu";
import { DataAnalyser } from "../../UserData/DataAnalyser";
import { Item } from "../../Menus/Item";


export class SerialPositionCurvePolicy implements ItemListPolicy {
  // Maximum number of items to keep
  maxNbItems: number = 2;

  // If true, ignore the current page
  ignoreCurrentPage: boolean = false;


  constructor () { }


  getItemList (menus: Menu[], analyser: DataAnalyser): Item[] {
    let analysis = analyser.analysePageVisits();

    let currentPagePathname = window.location.pathname;

    // Compute a familiarity score for each page, based on the serial position curve
    // The score computation rules are taken from the Familiariser [Todi et al. 18]
    let familiarityScores = new Map();

    // First filter out the current page pathname if required
    if (this.ignoreCurrentPage) {
      analysis.visitDurations.delete(currentPagePathname);
    }

    for (let pathname of analysis.firstVisitTimestamps.keys()) {
      // Recency and primacy (note: lower values lead to higher score below!)
      let recency = 0;
      let primacy = 0;

      let lastVisitTimestamp = analysis.lastVisitTimestamps.get(pathname);
      let firstVisitTimestamp = analysis.firstVisitTimestamps.get(pathname);

      for (let p of analysis.lastVisitTimestamps.keys()) {
        if (analysis.lastVisitTimestamps.get(p) > lastVisitTimestamp) {
          recency++;
        }

        if (analysis.firstVisitTimestamps.get(p) < firstVisitTimestamp) {
          primacy++;
        }
      }

      // Intermediate scores used to compute the familiarity score
      let frequencyScore = analysis.visitFrequencies.get(pathname);
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

    // Find the first (at most) maxNbItems associations between an item and a page
    let selectedItems = [];

    let items = Menu.getAllMenusItems(menus);
    for (let page of pagesSortedByFamiliarity) {
      for (let item of items) {
        let matchingLinkNodes = item.findLinkNodes(page.pathname);

        if (matchingLinkNodes.length > 0) {
          selectedItems.push(item);
          break;
        }
      }

      if (selectedItems.length === this.maxNbItems) {
        break;
      }
    }

    // Only keep and return the top maxNbItems items
    return selectedItems;
  }
}
