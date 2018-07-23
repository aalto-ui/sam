import { Menu } from "../../../elements/Menu";
import { DataManager } from "../../../data/DataManager";
import { Highlight } from "../Highlight";
import { ReorderItems } from "../ReorderItems";
import { Policy } from "../../policies/Policy";
import { Technique } from "../Technique";


export class HighlightAndReorderItems implements Technique<Policy> {

  readonly name: string = "Highlight + reorder items";

  // Instances of other techniques used by this mixed one
  readonly highlight: Highlight;
  readonly reorder: ReorderItems;


  constructor () {
    this.highlight = new Highlight();
    this.reorder = new ReorderItems();
  }

  reset () {
    this.reorder.reset();
    this.highlight.reset();
  }

  apply (menus: Menu[], policy: Policy, dataManager?: DataManager) {
    this.highlight.apply(menus, policy, dataManager);
    this.reorder.apply(menus, policy, dataManager);
  }
}
