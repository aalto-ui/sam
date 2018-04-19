import * as $ from "jquery";
import { Reorder } from "./Reorder";
import { Menu } from "../../Elements/Menu";
import { ItemGroupListPolicy } from "../Policies/ItemGroupListPolicy";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { ItemGroup } from "../../Elements/ItemGroup";


export class ReorderGroups extends Reorder {
  protected static readonly REORDERED_ELEMENT_CLASS: string = "awm-reordered-group";


  constructor () {
    super();
  }

  apply (menus: Menu[], policy: ItemGroupListPolicy, analyser?: DataAnalyser) {
    let groups = policy.getItemGroupList(menus, analyser)
      .slice(0, this.maxNbItems);

    this.moveAllElements(groups);
  }
}
