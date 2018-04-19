import { ItemListPolicy } from "./ItemListPolicy";
import { ItemGroupListPolicy } from "./ItemGroupListPolicy";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";
import { ItemGroup } from "../../Elements/ItemGroup";
import { AdaptiveElement } from "../../Elements/AdaptiveElement";


export class MostClickedItemListPolicy implements ItemListPolicy, ItemGroupListPolicy {
  // If true, only keep items which have already been clicked at least once
  onlyClickedItems: boolean = false;

  // If true, only compute stats concerning the local clicks
  // In other words, only consider pathnames equal to the one of the current page
  onlyLocalClicks: boolean = false;


  constructor () { }

  private getItemNbClicks (item: Item, analysis: any) {
    let currentPagePathname = window.location.pathname;

    let itemID = item.id;
    let groupID = item.parent.id;
    let menuID = item.parent.parent.id;

    // Attempt to find click data on current item in the logs
    try {
      let analysedItem = analysis.menus[menuID].groups[groupID].items[itemID];

      // If required, only consider the number of clicks from current page pathname
      if (this.onlyLocalClicks) {
        return analysedItem.nbLocalClicks;
      }

      return analysedItem.nbClicks;
    }
    catch {
      return 0;
    }
  }

  private getGroupNbClicks (group: ItemGroup, analysis: any) {
    let currentPagePathname = window.location.pathname;

    let groupID = group.id;
    let menuID = group.parent.id;

    // Attempt to find click data on current item in the logs
    try {
      let analysedGroup = analysis.menus[menuID].groups[groupID];

      // If required, only consider the number of clicks from current page pathname
      if (this.onlyLocalClicks) {
        return analysedGroup.nbLocalClicks;
      }

      return analysedGroup.nbClicks;
    }
    catch {
      return 0;
    }
  }

  private mapItemsToNbClicks (items: Item[], analysis: any): Map<Item, number> {
    let itemsMappedToNbClicks = new Map();

    for (let item of items) {
      let nbClicks = this.getItemNbClicks(item, analysis);
      itemsMappedToNbClicks.set(item, nbClicks);
    }

    return itemsMappedToNbClicks;
  }

  private mapGroupsToNbClicks (groups: ItemGroup[], analysis: any): Map<ItemGroup, number> {
    let groupsMappedToNbClicks = new Map();

    for (let group of groups) {
      let nbClicks = this.getGroupNbClicks(group, analysis);
      groupsMappedToNbClicks.set(group, nbClicks);
    }

    return groupsMappedToNbClicks;
  }

  private sortAnFilterMappedClickedElements<E extends AdaptiveElement> (elementsMappedToNbClicks: Map<E, number>) {
    // Turn the map into a list sorted by the nb of clicks
    let sortedItemsAndNbClicks = [...elementsMappedToNbClicks.entries()]
      .map(tuple => {
        return { element: tuple[0], nbClicks: tuple[1] };
      })
      .sort((e1, e2) => {
        return e2.nbClicks - e1.nbClicks;
      });

    // If required, filter that list to only keep already clicked elements
    if (this.onlyClickedItems) {
      sortedItemsAndNbClicks = sortedItemsAndNbClicks.filter(e => {
        return e.nbClicks > 0;
      });
    }

    // Only return a list of elements
    return sortedItemsAndNbClicks.map(e => {
      return e.element;
    });
  }

  getItemList (menus: Menu[], analyser: DataAnalyser): Item[] {
    let itemClickAnalysis = analyser.analyseItemClicks();
    let allItems = Menu.getAllMenusItems(menus);

    let itemsMappedToNbClicks = this.mapItemsToNbClicks(allItems, itemClickAnalysis);
    return this.sortAnFilterMappedClickedElements(itemsMappedToNbClicks);
  }

  getItemGroupList (menus: Menu[], analyser: DataAnalyser): ItemGroup[] {
    let itemClickAnalysis = analyser.analyseItemClicks();
    let allGroups = Menu.getAllMenusGroups(menus);

    let groupsMappedToNbClicks = this.mapGroupsToNbClicks(allGroups, itemClickAnalysis);
    return this.sortAnFilterMappedClickedElements(groupsMappedToNbClicks);
  }
}
