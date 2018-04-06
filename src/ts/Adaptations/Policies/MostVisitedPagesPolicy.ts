import * as $ from "jquery";
import { ItemListPolicy } from "./ItemListPolicy";
import { Menu } from "../../Menus/Menu";
import { DataAnalyser } from "../../UserData/DataAnalyser";
import { Item } from "../../Menus/Item";


export class MostVisitedPagesPolicy implements ItemListPolicy {
  // Maximum number of items to keep
  maxNbItems: number = 1;

  // If true, ignore the number of visits of the current page
  ignoreCurrentPage: boolean = false;

  // Maximum number of clicks on an item allowed to keep it
  // In other words, ignore links to most visited pages
  // if they have been clicked more than this number of times
  maxNbClicksThreshold: number = 10000;

  // Minimum number of visits of a page required to consider it
  minPageNbVisits: number = 1;


  constructor () { }


  getItemList (menus: Menu[], analyser: DataAnalyser): Item[] {
    let itemClickAnalysis = analyser.analyseItemClicks();
    let pageVisitsAnalysis = analyser.analysePageVisits();

    let currentPagePathname = window.location.pathname;

    // Turn the pathname-to-visits map into a list sorted by the number of visits,
    // and filter out the entries with too little visits

    // First filter out the current page pathname if required
    if (this.ignoreCurrentPage) {
      pageVisitsAnalysis.nbVisits.delete(currentPagePathname);
    }

    let pagesSortedByNbVisits = [...pageVisitsAnalysis.nbVisits.entries()]
      .map(tuple => {
        return { pathname: tuple[0], nbVisits: tuple[1] };
      })
      .filter(e => {
        return e.nbVisits >= this.minPageNbVisits;
      })
      .sort((e1, e2) => {
        return e2.nbVisits - e1.nbVisits;
      });

    // console.log("Sorted pages:", pagesSortedByNbVisits);

    // Filter items: only keep those with at most maxNbClicksThreshold clicks
    // Note: this code assumes an item is always linked to at most one link, and if so, always the same
    let items = Menu.getAllMenusItems(menus);
    let filteredItems = items.filter(item => {
      let itemID = item.getID();

      // Attempt to find click data on current item in the logs
      try {
        let itemNbClick = itemClickAnalysis.itemsNbClicks[itemID];
        return itemNbClick <= this.maxNbClicksThreshold;
      }
      catch {
        return true;
      }
    });

    // console.log("Filtered items:", filteredItems);

    // Find the first (at most) maxNbItems associations between an item and a page
    let selectedItems = [];

    for (let page of pagesSortedByNbVisits) {
      for (let item of filteredItems) {
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
