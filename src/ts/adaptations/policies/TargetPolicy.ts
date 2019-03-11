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


export interface TargetPolicy {

  /**
   * Name of the target policy.
   * It must be unique among all policies.
   */
  readonly name: string;

  // ===========================================================================
  // Item scoring & sorting
  // ===========================================================================

  /**
   * Get a sorted list of all items (from all menus) with scores assigned by the policy.
   * The policy is responsible for assigning scores and sorting the items accordingly.
   * 
   * @param  menuManager The menu manager containing the items to rank and sort.
   * @param  dataManager The data manager containing data for the policy.
   * @return             A sorted list of items with their scores.
   */
  getSortedItemsWithScores (menuManager: MenuManager, dataManager?: DataManager): ItemWithScore[];

  /**
   * Get a list of all items (from all menus) sorted by their scores,
   * i.e. in the same order than the list returned by [[getSortedItemsWithScores]].
   * 
   * @param  menuManager The menu manager containing the items to sort.
   * @param  dataManager The data manager containing data for the policy.
   * @return             A sorted list of items.
   */
  getSortedItems (menuManager: MenuManager, dataManager?: DataManager): Item[];


  // ===========================================================================
  // Group scoring & sorting
  // ===========================================================================

  /**
   * Get a sorted list of all groups (from all menus) with scores assigned by the policy.
   * The policy is responsible for assigning scores and sorting the groups accordingly.
   * 
   * @param  menuManager The menu manager containing the groups to rank and sort.
   * @param  dataManager The data manager containing data for the policy.
   * @return             A sorted list of groups with their scores.
   */
  getSortedItemGroupsWithScores (menuManager: MenuManager, dataManager?: DataManager): ItemGroupWithScore[];

  /**
   * Get a list of all groups (from all menus) sorted by their scores,
   * i.e. in the same order than the list returned by [[getSortedItemGroupsWithScores]].
   * 
   * @param  menuManager The menu manager containing the groups to sort.
   * @param  dataManager The data manager containing data for the policy.
   * @return             A sorted list of groups.
   */
  getSortedItemGroups (menuManager: MenuManager, dataManager?: DataManager): ItemGroup[];
}
