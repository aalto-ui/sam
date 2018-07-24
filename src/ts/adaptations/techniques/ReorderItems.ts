import { Reorder } from "./Reorder";
import { MenuManager } from "../../elements/MenuManager";
import { DataManager } from "../../data/DataManager";
import { Item } from "../../elements/Item";
import { Policy } from "../policies/Policy";


export class ReorderItems extends Reorder {

  protected static readonly REORDERED_ELEMENT_CLASS: string = "awm-reordered-item";

  readonly name: string = "Reorder items";


  constructor () {
    super();
  }

  protected getReorderedElementClass (): string {
    return "awm-reordered-item";
  }

  protected getReorderedElementType (): string {
    return Item.ELEMENT_TYPE;
  }

  private getFilteredSortedItems (menuManager: MenuManager, policy: Policy, dataManager?: DataManager): Item[] {
    return policy.getSortedItemsWithScores(menuManager, dataManager)
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

  private getMaxNbItemsToReorder (nbItems: number): number {
    return Math.floor(Math.sqrt(nbItems));
  }

  private getMaxNbItemsToReorderInGroup (nbItemsInGroup: number): number {
    return Math.floor(Math.sqrt(nbItemsInGroup));
  }

  private splitAndApplyByGroup (items: Item[]) {
    let topItemsSplitByGroup = Item.splitAllByGroup(items);

    for (let sameGroupItems of topItemsSplitByGroup) {
      this.applyInGroup(sameGroupItems);
    }
  }

  private applyInGroup (sameGroupItems: Item[]) {
    // Splice the same group items to only reorder the top ones
    let totalNbGroupItems = sameGroupItems[0].parent.items.length;
    let nbTopSameGroupItemsToKeep = this.getMaxNbItemsToReorderInGroup(totalNbGroupItems);
    let topSameGroupItems = sameGroupItems.splice(0, nbTopSameGroupItemsToKeep);

    this.reorderAllElements(topSameGroupItems);
  }

  apply (menuManager: MenuManager, policy: Policy, dataManager?: DataManager) {
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
