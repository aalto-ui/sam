import { Menu } from "../../../elements/Menu";
import { DataManager } from "../../../data/DataManager";
import { Highlight } from "../Highlight";
import { ReorderItems } from "../ReorderItems";
import { Fold } from "../Fold";
import { NodeIndexOrderPolicy } from "../../policies/NodeIndexOrderPolicy";
import { Policy } from "../../policies/Policy";
import { Technique } from "../Technique";


export class HighlightReorderItemsAndFold implements Technique<Policy> {

  readonly name: string = "Highlight + reorder + fold";

  // Instances of other techniques used by this mixed one
  readonly highlight: Highlight;
  readonly reorder: ReorderItems;
  readonly fold: Fold;

  readonly NodeIndexOrderPolicy: NodeIndexOrderPolicy;


  constructor () {
    this.highlight = new Highlight();
    this.reorder = new ReorderItems();
    this.fold = new Fold();

    this.NodeIndexOrderPolicy = new NodeIndexOrderPolicy();
  }

  reset () {
    this.fold.reset();
    this.reorder.reset();
    this.highlight.reset();
  }

  apply (menus: Menu[], policy: Policy, dataManager?: DataManager) {
    this.highlight.apply(menus, policy, dataManager);
    this.reorder.apply(menus, policy, dataManager);
    this.fold.apply(menus, this.NodeIndexOrderPolicy);
  }
}
