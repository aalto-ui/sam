import { MenuManager } from "../../elements/MenuManager";
import { DataManager } from "../../data/DataManager";
import { Item } from "../../elements/Item";
import { ItemGroup } from "../../elements/ItemGroup";
import { AdaptiveElement } from "../../elements/AdaptiveElement";
import { ItemClicksAnalysis, ItemClicksAnalyser } from "../../data/ItemClicksAnalyser";
import { Policy, ItemWithScore, ItemGroupWithScore } from "./Policy";


interface ElementWithNbClicks<E extends AdaptiveElement> {
  element: E;
  nbClicks: number;
}


export class MostClickedItemListPolicy extends Policy {

  /*************************************************************** PROPERTIES */

  readonly name: string = "Most clicked items";

  // If true, only compute stats from click events recorded on the current page
  onlyLocalClicks: boolean = false;


  /************************************************************** CONSTRUCTOR */

  constructor () {
    super();
  }


  /****************************************************************** METHODS */

  private sortMappedElementsByNbClicks<E extends AdaptiveElement> (elementsToNbClicks: Map<E, number>): ElementWithNbClicks<E>[] {
    // Turn the map into a list sorted by the nb of clicks
    return [...elementsToNbClicks.entries()]
      .map((tuple) => {
        return { element: tuple[0], nbClicks: tuple[1] };
      })
      .sort((e1, e2) => {
        return e2.nbClicks - e1.nbClicks;
      });
  }


  /****************************************************************************/
  /* Item scoring & sorting
  /****************************************************************************/

  private getItemNbClicks (item: Item, analysis: ItemClicksAnalysis): number {
    let itemStats = analysis.itemStats.get(item.id);

    return this.onlyLocalClicks
         ? itemStats.localNbClicks
         : itemStats.nbClicks;
  }

  private mapItemsToNbClicks (items: Item[], analysis: ItemClicksAnalysis): Map<Item, number> {
    let itemsMappedToNbClicks = new Map();

    for (let item of items) {
      let nbClicks = this.getItemNbClicks(item, analysis);
      itemsMappedToNbClicks.set(item, nbClicks);
    }

    return itemsMappedToNbClicks;
  }

  getSortedItemsWithScores (menuManager: MenuManager, dataManager?: DataManager): ItemWithScore[] {
    let itemClicksAnalysis = dataManager.analyser.getItemClickAnalysis();

    // Get all items, and split them in two arrays,
    // according to whether there are stats (= recorded clicks) on them or not
    let items = menuManager.getAllItems();
    let splitItems = ItemClicksAnalyser.splitItemsByStatsAvailability(items, itemClicksAnalysis);

    let itemsMappedToNbClicks = this.mapItemsToNbClicks(splitItems.withStats, itemClicksAnalysis);
    let sortedItems = this.sortMappedElementsByNbClicks(itemsMappedToNbClicks);

    // Make items with scores out of the ordered items and their nb of clicks
    let totalNbConsideredClicks = this.onlyLocalClicks
                                ? itemClicksAnalysis.totalLocalNbClicks
                                : itemClicksAnalysis.totalNbClicks;

    let sortedItemsWithScores = sortedItems.map((e) => {
      return {
        item: e.element,
        score: e.nbClicks / totalNbConsideredClicks
      };
    });

    let remainingItemsWithScores = splitItems.withoutStats.map((item) => {
      return {
        item: item,
        score: 0
      };
    });

    return sortedItemsWithScores.concat(remainingItemsWithScores);
  }


  /****************************************************************************/
  /* Group scoring & sorting
  /****************************************************************************/

  private getGroupNbClicks (group: ItemGroup, analysis: ItemClicksAnalysis): number {
    let groupStats = analysis.groupStats.get(group.id);

    return this.onlyLocalClicks
         ? groupStats.localNbClicks
         : groupStats.nbClicks;
  }

  private mapGroupsToNbClicks (groups: ItemGroup[], analysis: ItemClicksAnalysis): Map<ItemGroup, number> {
    let groupsMappedToNbClicks = new Map();

    for (let group of groups) {
      let nbClicks = this.getGroupNbClicks(group, analysis);
      groupsMappedToNbClicks.set(group, nbClicks);
    }

    return groupsMappedToNbClicks;
  }

  getSortedItemGroupsWithScores (menuManager: MenuManager, dataManager?: DataManager): ItemGroupWithScore[] {
    let itemClicksAnalysis = dataManager.analyser.getItemClickAnalysis();

    // Get all item groups, and split them in two arrays,
    // according to whether there are stats (= recorded clicks) on them or not
    let groups = menuManager.getAllGroups();
    let splitGroups = ItemClicksAnalyser.splitItemGroupsByStatsAvailability(groups, itemClicksAnalysis);

    let groupsMappedToNbClicks = this.mapGroupsToNbClicks(splitGroups.withStats, itemClicksAnalysis);
    let sortedGroups = this.sortMappedElementsByNbClicks(groupsMappedToNbClicks);

    // Make item groups with scores out of the ordered item groups and their nb of clicks
    let totalNbConsideredClicks = this.onlyLocalClicks
                                ? itemClicksAnalysis.totalLocalNbClicks
                                : itemClicksAnalysis.totalNbClicks;

    let sortedGroupsWithScores = sortedGroups.map((e) => {
      return {
        group: e.element,
        score: e.nbClicks / totalNbConsideredClicks
      };
    });

    let remainingGroupsWithScores = splitGroups.withoutStats.map((group) => {
      return {
        group: group,
        score: 0
      };
    });

    return sortedGroupsWithScores.concat(remainingGroupsWithScores);
  }
}
