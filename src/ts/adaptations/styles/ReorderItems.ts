/** @module adaptation */

import { Reorder } from "./Reorder";
import { MenuManager } from "../../elements/MenuManager";
import { DataManager } from "../../data/DataManager";
import { Item } from "../../elements/Item";
import { TargetPolicy } from "../policies/TargetPolicy";


export class ReorderItems extends Reorder {

  // ============================================================ PROPERTIES ===

  /** HTML class of item elements which have been reordered. */
  static readonly REORDERED_ELEMENT_CLASS: string = "sam-reordered-item";

  readonly name: string = "Reorder items";


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of ReorderItem.
   */
  constructor () {
    super();
  }


  // =============================================================== METHODS ===


  // ===========================================================================
  // Utility
  // ===========================================================================

  protected getReorderedElementClass (): string {
    return "sam-reordered-item";
  }

  protected getReorderedElementType (): string {
    return Item.ELEMENT_TYPE;
  }


  // ===========================================================================
  // Apply style
  // ===========================================================================

  /**
   * Use the given policy to score and sort the items of all the menus to adapt,
   * and filter out any item which:
   * - cannot be reordered;
   * - has a null (0) score.
   *
   * @param  menuManager The menu manager containing the menus with items to reorder.
   * @param  policy      The policy to use to score the items.
   * @param  dataManager The data manager containing data for the policy.
   * @return             A sorted and filtered list of items.
   */
  private getFilteredSortedItems (menuManager: MenuManager, policy: TargetPolicy, dataManager?: DataManager): Item[] {
    return policy
      .getSortedItemsWithScores(menuManager, dataManager)
      .filter((itemWithScore) => {
        if (! itemWithScore.item.canBeReordered) {
          return false;
        }

        return itemWithScore.score > 0;
      })
      .map((itemWithScore) => {
        return itemWithScore.item;
      });
  }

  /**
   * Return the maximum number of items which can be reordered in a menu.
   *
   * @param  nbItems The total number of items in the menu.
   * @return         The maximum number of items to reorder in the menu.
   */
  private getMaxNbItemsToReorder (nbItems: number): number {
    return Math.floor(Math.sqrt(nbItems));
  }

  /**
   * Return the maximum number of items which can be reordered in a group.
   *
   * @param  nbItemsInGroup The total number of items in the group.
   * @return                The maximum number of items to reorder in the group.
   */
  private getMaxNbItemsToReorderInGroup (nbItemsInGroup: number): number {
    return Math.floor(Math.sqrt(nbItemsInGroup));
  }

  /**
   * Reorder all the given elements, in the given order,
   * assuming they all belong to the same group.
   *
   * @param  sameGroupItems A sorted list of items located in the same group.
   */
  private applyInGroup (sameGroupItems: Item[]) {
    // Splice the same group items to only reorder the top ones
    let totalNbGroupItems = sameGroupItems[0].parent.items.length;
    let nbTopSameGroupItemsToKeep = this.getMaxNbItemsToReorderInGroup(totalNbGroupItems);
    let topSameGroupItems = sameGroupItems.splice(0, nbTopSameGroupItemsToKeep);

    this.reorderAllElements(topSameGroupItems);
  }

  /**
   * Split all the given items by their group, and reorder them group by group
   * (using [[applyInGroup]]).
   *
   * @param  items A sorted list of items to reorder.
   */
  private splitAndApplyByGroup (items: Item[]) {
    let topItemsSplitByGroup = Item.splitAllByGroup(items);

    for (let sameGroupItems of topItemsSplitByGroup) {
      this.applyInGroup(sameGroupItems);
    }
  }

  apply (menuManager: MenuManager, policy: TargetPolicy, dataManager?: DataManager) {
    let items = this.getFilteredSortedItems(menuManager, policy, dataManager);

    // Save some children in their original order to be able to reset the reordering
    this.saveParentNodeChildrenInOriginalOrder(items);

    // Splice the items to only reorder the top ones
    let totalNbItems = menuManager.getNbItems();
    let nbTopItemsToKeep = this.getMaxNbItemsToReorder(totalNbItems);
    let topItems = items.slice(0, nbTopItemsToKeep);

    this.splitAndApplyByGroup(topItems);
  }
}
