import { ItemListPolicy } from "./ItemListPolicy";
import { ItemGroupListPolicy } from "./ItemGroupListPolicy";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";
import { ItemGroup } from "../../Elements/ItemGroup";
import { AdaptiveElement } from "../../Elements/AdaptiveElement";
import { ItemClicksAnalysis } from "../../Data/ItemClicksAnalyser";


export class MostClickedItemListPolicy implements ItemListPolicy, ItemGroupListPolicy {
  // If true, only compute stats concerning the local clicks
  // In other words, only consider pathnames equal to the one of the current page
  onlyLocalClicks: boolean = false;


  constructor () { }

  private getItemNbClicks (item: Item, analysis: ItemClicksAnalysis): number {
    let itemID = item.id;
    let itemStats = analysis.itemStats[itemID];

    if (this.onlyLocalClicks) {
      return itemStats.localNbClicks;
    }

    return itemStats.nbClicks;
  }

  private getGroupNbClicks (group: ItemGroup, analysis: ItemClicksAnalysis) {
    let groupID = group.id;
    let groupStats = analysis.groupStats[groupID];

    if (this.onlyLocalClicks) {
      return groupStats.localNbClicks;
    }

    return groupStats.nbClicks;
  }

  private mapItemsToNbClicks (items: Item[], analysis: ItemClicksAnalysis): Map<Item, number> {
    let itemsMappedToNbClicks = new Map();

    for (let item of items) {
      let nbClicks = this.getItemNbClicks(item, analysis);
      itemsMappedToNbClicks.set(item, nbClicks);
    }

    return itemsMappedToNbClicks;
  }

  private mapGroupsToNbClicks (groups: ItemGroup[], analysis: ItemClicksAnalysis): Map<ItemGroup, number> {
    let groupsMappedToNbClicks = new Map();

    for (let group of groups) {
      let nbClicks = this.getGroupNbClicks(group, analysis);
      groupsMappedToNbClicks.set(group, nbClicks);
    }

    return groupsMappedToNbClicks;
  }

  private sortMappedClickedElements<E extends AdaptiveElement> (elementsMappedToNbClicks: Map<E, number>) {
    // Turn the map into a list sorted by the nb of clicks
    let sortedItemsAndNbClicks = [...elementsMappedToNbClicks.entries()]
      .map(tuple => {
        return { element: tuple[0], nbClicks: tuple[1] };
      })
      .sort((e1, e2) => {
        return e2.nbClicks - e1.nbClicks;
      });

    // Only return a list of elements
    return sortedItemsAndNbClicks.map(e => {
      return e.element;
    });
  }

  getItemList (menus: Menu[], analyser: DataAnalyser): Item[] {
    let itemClicksAnalysis = analyser.getItemClickAnalysis();

    // Get all items, and split them in two arrays,
    // according to whether there are stats (= recorded clicks) on them or not
    let items = Menu.getAllMenusItems(menus);
    let splitItems = Item.splitAllByStatsAvailability(items, itemClicksAnalysis);

    let itemsMappedToNbClicks = this.mapItemsToNbClicks(splitItems.withStats, itemClicksAnalysis);
    let sortedItems = this.sortMappedClickedElements(itemsMappedToNbClicks);

    return sortedItems.concat(splitItems.withoutStats);
  }

  getItemGroupList (menus: Menu[], analyser: DataAnalyser): ItemGroup[] {
    let itemClicksAnalysis = analyser.getItemClickAnalysis();
    let allGroups = Menu.getAllMenusGroups(menus);

    // Get all item groups, and split them in two arrays,
    // according to whether there are stats (= recorded clicks) on them or not
    let groups = Menu.getAllMenusGroups(menus);
    let splitGroups = ItemGroup.splitAllByStatsAvailability(groups, itemClicksAnalysis);

    let groupsMappedToNbClicks = this.mapGroupsToNbClicks(splitGroups.withStats, itemClicksAnalysis);
    let sortedGroups = this.sortMappedClickedElements(groupsMappedToNbClicks);

    return sortedGroups.concat(splitGroups.withoutStats);
  }
}
