import * as $ from "jquery";
import { ItemListPolicy } from "./ItemListPolicy";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";


export class MostRecentVisitsPolicy implements ItemListPolicy {
  // Maximum number of items to keep
  maxNbItems: number = 2;

  // If true, ignore the current page
  ignoreCurrentPage: boolean = false;

  // Maximum number of clicks on an item allowed to keep it
  // In other words, ignore links to most visited pages
  // if they have been clicked more than this number of times
  maxNbClicksThreshold: number = 200;

  // Minimum accepted timestamp to consider a visit (in ms)
  minVisitTimestamp: number = Date.now() - (10e3 * 3600); // last hour

  // Maximum accepted timestamp to consider a visit (in ms)
  maxVisitTimestamp: number = Date.now();


  constructor () { }


  getItemList (menus: Menu[], analyser: DataAnalyser): Item[] {
    let itemClickAnalysis = analyser.analyseItemClicks();
    let pageVisitsAnalysis = analyser.analysePageVisits();

    let currentPagePathname = window.location.pathname;

    // Turn the pathname-to-visits map into a list sorted by the visit recencies,
    // and filter out the entries outside timestamp bounds

    // First filter out the current page pathname if required
    if (this.ignoreCurrentPage) {
      pageVisitsAnalysis.lastVisitTimestamps.delete(currentPagePathname);
    }

    let pagesSortedByRecency = [...pageVisitsAnalysis.lastVisitTimestamps.entries()]
      .map(tuple => {
        return { pathname: tuple[0], timestamp: tuple[1] };
      })
      .filter(e => {
        return e.timestamp >= this.minVisitTimestamp
            && e.timestamp <= this.maxVisitTimestamp;
      })
      .sort((e1, e2) => {
        return e2.timestamp - e1.timestamp;
      });

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

    // Find the first (at most) maxNbItems associations between an item and a page
    let selectedItems = [];

    // Helper function to find all elements from a root node
    // which are links containing a given pathname
    function findRelatedLinkNodes (node: JQuery, pathname: string) {
      let linkNodes = node.add(node.find("a"));

      // Only keep links whose href attribute match the end of the current page pathname
      return linkNodes.filter((index, element) => {
        let href = $(element).attr("href");
        return href.length > 0
            && pathname.endsWith(href);
      });
    }

    // Only keep and return the top maxNbItems items
    for (let page of pagesSortedByRecency) {
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

    return selectedItems;
  }
}
