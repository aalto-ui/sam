import { ItemListPolicy } from "./ItemListPolicy";
import { Menu } from "../../Menus/Menu";
import { DataAnalyser } from "../../UserData/DataAnalyser";
import { Item } from "../../Menus/Item";

////////////// DEBUG
let debug_nb_clicks_already_added_flag = false;


export class MostClickedItemListPolicy implements ItemListPolicy {
  // Maximum number of items to keep
  maxNbItems: number = 2;

  // If true, only keep items which have already been clicked at least once
  onlyClickedItems: boolean = true;

  // If true, only compute stats concerning the local clicks
  // In other words, only consider pathnames equal to the one of the current page
  onlyLocalClicks: boolean = false;


  constructor () { }

  private getItemNbClicks (item: Item, analysis: {menus: object}) {
    let currentPagePathname = window.location.pathname;

    let itemID = item.getID();
    let groupID = item.parent.getID();
    let menuID = item.parent.parent.getID();

    // Attempt to find click data on current item in the logs
    try {
      let analysedItem = analysis.menus[menuID].groups[groupID].items[itemID];

      // If required, only consider the number of clicks from current page pathname
      if (this.onlyLocalClicks) {
        if (analysedItem.nbClicksByPathname.has(currentPagePathname)) {
          return analysedItem.nbClicksByPathname.get(currentPagePathname);
        }
        else {
          return 0;
        }
      }

      return analysedItem.nbClicks;
    }
    catch {
      return 0;
    }
  }

  private mapItemsToNbClicks (menus: Menu[], analysis: {menus: object}): Map<Item, number> {
    let itemsMappedToNbClicks = new Map();
    let allItems = Menu.getAllMenusItems(menus);

    for (let item of allItems) {
      let nbClicks = this.getItemNbClicks(item, analysis);
      itemsMappedToNbClicks.set(item, nbClicks);
    }

    ////////////////////////////////////////////////////////////////////////////
    // DEBUG: add scores and IDs to items inner HTML

    if (! debug_nb_clicks_already_added_flag) {
      for (let item of allItems) {
        let id = item.getID();
        let nbClicks = itemsMappedToNbClicks.get(item);

        //console.log("Append info to", node, id);
        // item.node.html(item.node.html() + `<small>(id: ${id} /  nbClicks: ${nbClicks})</small>`);
        item.node.html(item.node.html() + `<span id="debug-item-nb-clicks"> (${nbClicks})</small>`);
      }

      debug_nb_clicks_already_added_flag = true;
    }

    ////////////////////////////////////////////////////////////////////////////

    return itemsMappedToNbClicks;
  }

  private sortAnFilterMappedItems (itemsMappedToNbClicks: Map<Item, number>) {
    // Turn the map into a list sorted by the nb of clicks
    let sortedItemsAndNbClicks = [...itemsMappedToNbClicks.entries()]
      .map(tuple => {
        return { item: tuple[0], nbClicks: tuple[1] };
      })
      .sort((e1, e2) => {
        return e2.nbClicks - e1.nbClicks;
      });

    // If required, filter that list to only keep already clicked items
    if (this.onlyClickedItems) {
      sortedItemsAndNbClicks = sortedItemsAndNbClicks.filter(e => {
        return e.nbClicks > 0;
      });
    }

    // Keep and return at most the maxNbItems first items
    if (sortedItemsAndNbClicks.length > this.maxNbItems) {
      sortedItemsAndNbClicks = sortedItemsAndNbClicks.slice(0, this.maxNbItems);
    }

    return sortedItemsAndNbClicks.map(e => {
      return e.item;
    });
  }

  getItemList (menus: Menu[], analyser: DataAnalyser): Item[] {
    let itemClickAnalysis = analyser.analyseItemClicks();

    let itemsMappedToNbClicks = this.mapItemsToNbClicks(menus, itemClickAnalysis);
    return this.sortAnFilterMappedItems(itemsMappedToNbClicks);
  }
}
