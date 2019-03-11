/** @module adaptation */

import { TargetPolicy, ItemWithScore, ItemGroupWithScore } from './TargetPolicy';
import { MenuManager } from "../../elements/MenuManager";
import { DataManager } from "../../data/DataManager";
import { Item } from "../../elements/Item";
import { ItemGroup } from "../../elements/ItemGroup";


export abstract class DefaultTargetPolicy implements TargetPolicy {

  // ============================================================ PROPERTIES ===

  abstract readonly name;

  // =========================================================== CONSTRUCTOR ===

  // =============================================================== METHODS ===


  // ===========================================================================
  // Item scoring & sorting
  // ===========================================================================

  abstract getSortedItemsWithScores (menuManager: MenuManager, dataManager?: DataManager): ItemWithScore[];

  /**
   * Get a list of all items (from all menus) sorted in the same order
   * than in the list returned by [[getSortedItemsWithScores]].
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
   * Get a sorted list of all groups (from all menus) with scores, so that:
   * - each group is given a normalised score, equal to the sum of the scores
   *   of all the items it contains (using [[getSortedItemsWithScores]])
   *   divided by the sum of the scores of all groups;
   * - the groups are then sorted by their scores.
   * 
   * This implementation can be overidden by any policy extending this class.
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
   * Get a list of all groups (from all menus) sorted in the same order
   * than the list returned by [[getSortedItemGroupsWithScores]].
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
