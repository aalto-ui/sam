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

  apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    let items = policy.getItemList(menus, analyser)
      .slice(0, this.maxNbItems);

    // Reorder items independently for each group
    let itemsSplitByGroup = Item.splitAllByGroup(items);
    for (let sameGroupItems of itemsSplitByGroup) {
      this.moveAllElements(sameGroupItems);
    }
  }
}
