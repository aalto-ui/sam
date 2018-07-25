import { MenuManager } from "../../../elements/MenuManager";
import { DataManager } from "../../../data/DataManager";
import { Highlight } from "../Highlight";
import { ReorderItems } from "../ReorderItems";
import { Fold } from "../Fold";
import { NodeIndexOrderPolicy } from "../../policies/NodeIndexOrderPolicy";
import { Policy } from "../../policies/Policy";
import { Technique } from "../Technique";


export class HighlightReorderItemsAndFold implements Technique<Policy> {

  /*************************************************************** PROPERTIES */

  readonly name: string = "Highlight + reorder + fold";

  // Instances of other techniques used by this mixed one
  private readonly highlight: Highlight;
  private readonly reorder: ReorderItems;
  private readonly fold: Fold;

  private readonly nodeIndexOrderPolicy: NodeIndexOrderPolicy;


  /************************************************************** CONSTRUCTOR */

  constructor () {
    this.highlight = new Highlight();
    this.reorder = new ReorderItems();
    this.fold = new Fold();

    this.nodeIndexOrderPolicy = new NodeIndexOrderPolicy();
  }


  /****************************************************************** METHODS */

  reset () {
    this.fold.reset();
    this.reorder.reset();
    this.highlight.reset();
  }

  apply (menuManager: MenuManager, policy: Policy, dataManager?: DataManager) {
    this.highlight.apply(menuManager, policy, dataManager);
    this.reorder.apply(menuManager, policy, dataManager);
    this.fold.apply(menuManager, this.nodeIndexOrderPolicy);
  }
}
