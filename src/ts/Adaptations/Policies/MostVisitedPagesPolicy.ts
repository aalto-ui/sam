import * as $ from "jquery";
import { ItemListPolicy } from "./ItemListPolicy";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";


export class MostVisitedPagesPolicy implements ItemListPolicy {
  // Maximum number of items to keep
  maxNbItems: number = 1;

  // If true, ignore the number of visits of the current page
  ignoreCurrentPage: boolean = false;


  constructor () { }


  getItemList (menus: Menu[], analyser: DataAnalyser): Item[] {
    let itemClickAnalysis = analyser.getItemClickAnalysis();
    let pageVisitsAnalysis = analyser.getPageVisitsAnalysis();

    let currentPagePathname = window.location.pathname;

    // Turn the pathname-to-visits map into a list sorted by the number of visits,
    // and filter out the entries with too little visits

    // First filter out the current page pathname if required
    if (this.ignoreCurrentPage) {
      delete pageVisitsAnalysis.nbVisits[currentPagePathname];
    }

    let pagesSortedByNbVisits = Object.keys(pageVisitsAnalysis.nbVisits)
      .map(pathname => {
        return { pathname: pathname, nbVisits: pageVisitsAnalysis.nbVisits[pathname] };
      })
      .sort((e1, e2) => {
        return e2.nbVisits - e1.nbVisits;
      });

    // Sort items according to the position of the pages pointed by their links
    // among previously ordered pages
    let items = Menu.getAllMenusItems(menus);

    let sortedItems = [];
    for (let page of pagesSortedByNbVisits) {
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
