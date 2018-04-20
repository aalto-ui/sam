import * as $ from "jquery";
import { ItemListPolicy } from "./ItemListPolicy";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";


export class LongestVisitDurationPolicy implements ItemListPolicy {
  // If true, ignore the stats of the current page
  ignoreCurrentPage: boolean = false;


  constructor () { }

  getItemList (menus: Menu[], analyser: DataAnalyser): Item[] {
    let itemClickAnalysis = analyser.getItemClickAnalysis();
    let pageVisitsAnalysis = analyser.getPageVisitsAnalysis();

    let currentPagePathname = window.location.pathname;

    // First filter out the current page pathname if required
    if (this.ignoreCurrentPage) {
      delete pageVisitsAnalysis.visitDurations[currentPagePathname];
    }


    let pagesSortedByDuration = Object.keys(pageVisitsAnalysis.visitDurations)
      .map(pathname => {
        return { pathname: pathname, duration: pageVisitsAnalysis.visitDurations[pathname] };
      })
      .sort((e1, e2) => {
        return e2.duration - e1.duration;
      });

    // Sort items according to the position of the pages pointed by their links
    // among previously ordered pages
    let items = Menu.getAllMenusItems(menus);

    let sortedItems = [];
    for (let page of pagesSortedByDuration) {
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
