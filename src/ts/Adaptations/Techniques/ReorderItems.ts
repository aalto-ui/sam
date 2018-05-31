import * as $ from "jquery";
import { Reorder } from "./Reorder";
import { Menu } from "../../Elements/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";


export class ReorderItems extends Reorder {
  protected static readonly REORDERED_ELEMENT_CLASS: string = "awm-reordered-item";


  constructor () {
    super();
  }

  protected getReorderedElementClass (): string {
    return "awm-reordered-item";
  }

  private getMaxNbItemsToReorder (nbItems: number): number {
    return Math.round(Math.sqrt(nbItems));
  }

  private getMaxNbItemsToReorderInGroup (nbItemsInGroup: number): number {
    return Math.round(Math.sqrt(nbItemsInGroup));
  }

  apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    let items = policy.getItemList(menus, analyser)
      .filter((item) => {
        let groupStats = analyser.getItemClickAnalysis().groupStats[item.parent.id];
        return groupStats !== undefined && groupStats.nbClicks > 0;
      });

    let nbTopItemsToKeep = this.getMaxNbItemsToReorder(items.length);
    let topItems = items.slice(0, nbTopItemsToKeep);

    let topItemsSplitByGroup = Item.splitAllByGroup(items);
    for (let sameGroupItems of topItemsSplitByGroup) {
      let nbTopSameGroupItemsToKeep = this.getMaxNbItemsToReorderInGroup(sameGroupItems.length);
      let topSameGroupItems = sameGroupItems.splice(0, nbTopSameGroupItemsToKeep);

      this.moveAllElements(topSameGroupItems);
    }
  }
}
