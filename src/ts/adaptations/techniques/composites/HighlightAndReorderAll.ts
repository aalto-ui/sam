import { ReorderItems } from "../ReorderItems";
import { ReorderGroups } from "./../ReorderGroups";
import { Menu } from "../../../elements/Menu";
import { DataManager } from "../../../data/DataManager";
import { Highlight } from "../Highlight";
import { Policy } from "../../policies/Policy";
import { Technique } from "../Technique";



export class HighlightAndReorderAll implements Technique<Policy> {

  readonly name: string = "Highlight + reorder items & groups";


  // Instances of other techniques used by this mixed one
  readonly highlight: Highlight;
  readonly reorderItems: ReorderItems;
  readonly reorderGroups: ReorderGroups;


  constructor () {
    this.highlight = new Highlight();
    this.reorderItems = new ReorderItems();
    this.reorderGroups = new ReorderGroups();
  }

  reset () {
    this.reorderGroups.reset();
    this.reorderItems.reset();
    this.highlight.reset();
  }

  apply (menus: Menu[], policy: Policy, dataManager?: DataManager) {
    this.highlight.apply(menus, policy, dataManager);
    this.reorderItems.apply(menus, policy, dataManager);
    this.reorderGroups.apply(menus, policy, dataManager);
  }
}
