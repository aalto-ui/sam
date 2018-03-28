import * as $ from "jquery";
import { Highlight } from "./Highlight";
import { DataAnalyser } from "../../UserData/DataAnalyser";
import { Item } from "../../Menus/Item";
import { Menu } from "../../Menus/Menu";


export class HighlightMostClickedItems extends Highlight {
  // Maximum number of items to hghlight
  private static MAX_NB_HIGHLIGHTED_ITEMS: number = 2;

  // If true, only highlight items which have already been clicked at least once
  private static ONLY_HIGHLIGHT_CLICKED_ITEMS: boolean = true;

  // If true, only compute stats concerning the local clicks
  // In other words, only consider pathnames equal to the one of the current page
  private static ONLY_CONSIDER_LOCAl_CLICKS: boolean = false;

  // TODO: clean and split code
  // Stats and node analysis should be moved elsewhere

  static apply (menus: Menu[], analyser: DataAnalyser) {
    let itemClickAnalysis = analyser.analyseItemClicks();

    // Map each item of the current page to their logged nb of click
    let currentPagePathname = window.location.pathname;
    let itemsNbClicks = new Map();

    let allItems = Menu.getAllMenusItems(menus);
    for (let item of allItems) {
      let itemID = item.getID();
      let groupID = item.parent.getID();
      let menuID = item.parent.parent.getID();

      // Attempt to find click data on current item in the logs
      try {
        let analysedItem = itemClickAnalysis.menus[menuID].groups[groupID].items[itemID];
        let nbClicks = analysedItem.nbClicks;

        // If required, only consider the number of clicks from current page pathname
        if (this.ONLY_CONSIDER_LOCAl_CLICKS) {
          if (analysedItem.nbClicksByPathname.has(currentPagePathname)) {
            nbClicks = analysedItem.nbClicksByPathname.get(currentPagePathname);
          }
          else {
            nbClicks = 0;
          }
        }

        itemsNbClicks.set(item, nbClicks);
      }
      catch {
        itemsNbClicks.set(item, 0);
      }
    }

    ////////////////////////////////////////////////////////////////////////////
    // DEBUG: add scores and IDs to items inner HTML

    for (let item of allItems) {
      let id = item.getID();
      let nbClicks = itemsNbClicks.get(item);

      //console.log("Append info to", node, id);
      // item.node.html(item.node.html() + `<small>(id: ${id} /  nbClicks: ${nbClicks})</small>`);
      item.node.html(item.node.html() + `<small> (${nbClicks})</small>`);
    }
    ////////////////////////////////////////////////////////////////////////////

    // Turn the map into a list sorted by the nb of clicks
    let sortedItemsAndNbClicks = [...itemsNbClicks.entries()]
      .map(tuple => {
        return { item: tuple[0], nbClicks: tuple[1] };
      })
      .sort((e1, e2) => {
        return e2.nbClicks - e1.nbClicks;
      });

    // If required, filter that list to only keep already clicked items
    if (this.ONLY_HIGHLIGHT_CLICKED_ITEMS) {
      sortedItemsAndNbClicks = sortedItemsAndNbClicks.filter(e => {
        return e.nbClicks > 0;
      });
    }

    console.log("Sorted items to highlight", sortedItemsAndNbClicks);

    // Only highlight the most clicked items, whose IDs are at the top that list
    Highlight.reset();

    let nbHighlightedItems = 0;
    for (let itemAndNbClicks of sortedItemsAndNbClicks) {
      Highlight.onElement(itemAndNbClicks.item);

      nbHighlightedItems++;
      if (nbHighlightedItems === this.MAX_NB_HIGHLIGHTED_ITEMS) {
        break;
      }
    }
  }
}
