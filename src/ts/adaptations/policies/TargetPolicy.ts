/** @module adaptation */

import { MenuManager } from "../../elements/MenuManager";
import { DataManager } from "../../data/DataManager";
import { Item } from "../../elements/Item";
import { ItemGroup } from "../../elements/ItemGroup";


/**
 * Interface of an object containing an item and its score
 * (according to a certain policy).
 */
export interface ItemWithScore {
  item: Item;
  score: number;
}

/**
 * Interface of an object containing a group and its score
 * (according to a certain policy).
 */
export interface ItemGroupWithScore {
  group: ItemGroup;
  score: number;
}


export abstract class TargetPolicy {

  // ============================================================ PROPERTIES ===

  /**
   * Name of the target policy.
   * It must be unique among all policies.
   */
  abstract readonly name: string;


  // =========================================================== CONSTRUCTOR ===

  // =============================================================== METHODS ===


  // ===========================================================================
  // Item scoring & sorting
  // ===========================================================================

  /**
   * Get a sorted list of all items (from all menus) with scores assigned by the policy.
   * The policy is responsible for assigning scores and sorting the items accordingly.
   * 
   * An implementation of this method is required in order to use the default implementations
   * of the other methods of any target policy.
   * 
   * @param  menuManager The menu manager containing the items to rank and sort.
   * @param  dataManager The data manager containing data for the policy.
   * @return             A sorted list of items with their scores.
   */
  abstract getSortedItemsWithScores (menuManager: MenuManager, dataManager?: DataManager): ItemWithScore[];

  /**
   * Get a sorted list of all items (from all menus).
   * 
   * This method relies on [[getSortedItemsWithScores]].
   * 
   * @param  menuManager The menu manager containing the items to sort.
   * @param  dataManager The data manager containing data for the policy.
   * @return             A sorted list of items.
   */
  getSortedItems (menuManager: MenuManager, dataManager?: DataManager): Item[] {
    return this.getSortedItemsWithScores(menuManager, dataManager)
      .map((itemWithScore) => {
        return itemWithScore.item;
      });
  }


  // ===========================================================================
  // Group scoring & sorting
  // ===========================================================================

  /**
   * Get a sorted list of all groups (from all menus) with scores assigned by the policy.
   * The policy is responsible for assigning scores and sorting the groups accordingly.
   * 
   * The default implementation of this method does the following:
   * - each group is given a score equel to the sum of the scores
   *   of all the items it contains (using [[getSortedItemsWithScores]]);
   * - the groups are then sorted by their scores.
   * 
   * The default implementation can be overidden by any policy.
   * 
   * @param  menuManager The menu manager containing the groups to rank and sort.
   * @param  dataManager The data manager containing data for the policy.
   * @return             A sorted list of groups with their scores.
   */
  getSortedItemGroupsWithScores (menuManager: MenuManager, dataManager?: DataManager): ItemGroupWithScore[] {
    let scorePerGroup = new Map<ItemGroup, number>();
    let sumOfScores = 0;

    // Get the scores of all items
    let sortedItemsWithScores = this.getSortedItemsWithScores(menuManager, dataManager);

    // Sum the indices for each group
    for (let itemWithScore of sortedItemsWithScores) {
      let score = itemWithScore.score;
      let group = itemWithScore.item.parent;

      if (! scorePerGroup.has(group)) {
        scorePerGroup.set(group, score);
      }
      else {
        let currentGroupScore = scorePerGroup.get(group);
        scorePerGroup.set(group, currentGroupScore + score);
      }

      sumOfScores += score;
    }

    // Sort the groups by the sum of their items' scores, in decreasing order
    return [...scorePerGroup.entries()]
      .sort((tuple1, tuple2) => {
        return tuple2[1] - tuple1[1];
      })
      .map((tuple) => {
        return {
          group: tuple[0],
          score: tuple[1] / sumOfScores
        };
      });
  }

  /**
   * Get a sorted list of all groups (from all menus).
   * 
   * This method relies on [[getSortedItemGroupsWithScores]].
   * 
   * @param  menuManager The menu manager containing the groups to sort.
   * @param  dataManager The data manager containing data for the policy.
   * @return             A sorted list of groups.
   */
  getSortedItemGroups (menuManager: MenuManager, dataManager?: DataManager): ItemGroup[] {
    return this.getSortedItemGroupsWithScores(menuManager, dataManager)
      .map((groupWithScore) => {
        return groupWithScore.group;
      });
  }
}
