import * as $ from "jquery";
import { ItemListPolicy } from "./ItemListPolicy";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";


export class MostRecentVisitsPolicy implements ItemListPolicy {
  // If true, ignore the recency of the current page
  ignoreCurrentPage: boolean = false;


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
      .sort((e1, e2) => {
        return e2.timestamp - e1.timestamp;
      });

    console.log("pagesSortedByRecency", pagesSortedByRecency)

    // Sort items according to the position of the pages pointed by their links
    // among previously ordered pages
    let items = Menu.getAllMenusItems(menus);

    let sortedItems = [];
    for (let page of pagesSortedByRecency) {
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

    console.log("concat", sortedItems.concat(items))


    // Finally return the sorted items, followed by the remaining unsorted items
    return sortedItems.concat(items);
  }
}
