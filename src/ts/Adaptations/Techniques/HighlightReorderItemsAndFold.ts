import * as $ from "jquery";
import { AdaptationTechnique } from "../Adaptation";
import { Menu } from "../../Elements/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Highlight } from "./Highlight";
import { ReorderItems } from "./ReorderItems";
import { Fold } from "./Fold";
import { NodeIndexOrderPolicy } from "../Policies/NodeIndexOrderPolicy";


export class HighlightReorderItemsAndFold implements AdaptationTechnique {

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

  apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    this.highlight.apply(menus, policy, analyser);
    this.reorder.apply(menus, policy, analyser);
    this.fold.apply(menus, this.NodeIndexOrderPolicy);
  }
}
