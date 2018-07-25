import { MenuManager } from "../../../elements/MenuManager";
import { DataManager } from "../../../data/DataManager";
import { Highlight } from "../Highlight";
import { ReorderItems } from "../ReorderItems";
import { Policy } from "../../policies/Policy";
import { Technique } from "../Technique";


export class HighlightAndReorderItems implements Technique<Policy> {

  /*************************************************************** PROPERTIES */

  readonly name: string = "Highlight + reorder items";


  /************************************************************** CONSTRUCTOR */

  // Instances of other techniques used by this mixed one
  private readonly highlight: Highlight;
  private readonly reorder: ReorderItems;


  /****************************************************************** METHODS */

  constructor () {
    this.highlight = new Highlight();
    this.reorder = new ReorderItems();
  }

  reset () {
    this.reorder.reset();
    this.highlight.reset();
  }

  apply (menuManager: MenuManager, policy: Policy, dataManager?: DataManager) {
    this.highlight.apply(menuManager, policy, dataManager);
    this.reorder.apply(menuManager, policy, dataManager);
  }
}
