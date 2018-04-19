import * as $ from "jquery";
import { AdaptationTechnique } from "../Adaptation";
import { Menu } from "../../Elements/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Highlight } from "./Highlight";
import { ReorderItems } from "./ReorderItems";


export class HighlightAndReorderItems implements AdaptationTechnique {

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

  apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    this.highlight.apply(menus, policy, analyser);
    this.reorder.apply(menus, policy, analyser);
  }
}
