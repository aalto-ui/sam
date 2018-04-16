import * as $ from "jquery";
import { ItemListPolicy } from "./ItemListPolicy";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";


export class LongestVisitDurationPolicy implements ItemListPolicy {
  // Maximum number of items to keep
  maxNbItems: number = 3;

  // If true, ignore the current page
  ignoreCurrentPage: boolean = false;

  // Maximum number of clicks on an item allowed to keep it
  // In other words, ignore links to most visited pages
  // if they have been clicked more than this number of times
  maxNbClicksThreshold: number = 200;

  // Minimum visit duration required to consider a page (in ms)
  minPageVisitDuration: number = 10000;


  constructor () { }


  getItemList (menus: Menu[], analyser: DataAnalyser): Item[] {
    let itemClickAnalysis = analyser.analyseItemClicks();
    let pageVisitsAnalysis = analyser.analysePageVisits();

    let currentPagePathname = window.location.pathname;

    // Turn the pathname-to-visits map into a list sorted by the visit durations,
    // and filter out the entries with too short visit durations

    // First filter out the current page pathname if required
    if (this.ignoreCurrentPage) {
      pageVisitsAnalysis.visitDurations.delete(currentPagePathname);
    }

    let pagesSortedByNbVisits = [...pageVisitsAnalysis.visitDurations.entries()]
      .map(tuple => {
        return { pathname: tuple[0], duration: tuple[1] };
      })
      .filter(e => {
        return e.duration >= this.minPageVisitDuration;
      })
      .sort((e1, e2) => {
        return e2.duration - e1.duration;
      });

    // console.log("Sorted pages:", pagesSortedByNbVisits);

    // Filter items: only keep those with at most maxNbClicksThreshold clicks
    // Note: this code assumes an item is always linked to at most one link, and if so, always the same
    let items = Menu.getAllMenusItems(menus);
    let filteredItems = items.filter(item => {
      let itemID = item.id;

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
