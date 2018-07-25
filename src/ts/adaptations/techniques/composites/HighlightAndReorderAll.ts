import { ReorderItems } from "../ReorderItems";
import { ReorderGroups } from "./../ReorderGroups";
import { MenuManager } from "../../../elements/MenuManager";
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

  apply (menuManager: MenuManager, policy: Policy, dataManager?: DataManager) {
    this.highlight.apply(menuManager, policy, dataManager);
    this.reorderItems.apply(menuManager, policy, dataManager);
    this.reorderGroups.apply(menuManager, policy, dataManager);
  }
}
