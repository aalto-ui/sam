import * as $ from "jquery";
import { Reorder } from "./Reorder";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";
import { Policy } from "../Policies/Policy";


export class ReorderItems extends Reorder {
  protected static readonly REORDERED_ELEMENT_CLASS: string = "awm-reordered-item";


  constructor () {
    super();
  }

  protected getReorderedElementClass (): string {
    return "awm-reordered-item";
  }

  protected getReorderedElementType (): string {
    return Item.ELEMENT_TYPE;
  }

  private getMaxNbItemsToReorder (nbItems: number): number {
    return Math.floor(Math.sqrt(nbItems));
  }

  private getMaxNbItemsToReorderInGroup (nbItemsInGroup: number): number {
    return Math.floor(Math.sqrt(nbItemsInGroup));
  }

  apply (menus: Menu[], policy: Policy, analyser?: DataAnalyser) {
    let totalNbItems = Menu.getAllMenusItems(menus).length;

    let items = policy.getSortedItems(menus, analyser)
      .filter(item => {
        if (! item.canBeReordered) {
          return false;
        }

        let itemStats = analyser.getItemClickAnalysis().itemStats[item.id];
        return itemStats !== undefined && itemStats.nbClicks > 0;
      });

    let nbTopItemsToKeep = this.getMaxNbItemsToReorder(totalNbItems);
    let topItems = items.slice(0, nbTopItemsToKeep);

    let topItemsSplitByGroup = Item.splitAllByGroup(topItems);
    for (let sameGroupItems of topItemsSplitByGroup) {
      let totalNbGroupItems = sameGroupItems[0].parent.items.length;
      let nbTopSameGroupItemsToKeep = this.getMaxNbItemsToReorderInGroup(totalNbGroupItems);
      let topSameGroupItems = sameGroupItems.splice(0, nbTopSameGroupItemsToKeep);

      this.reorderAllElements(topSameGroupItems);
    }
  }
}
