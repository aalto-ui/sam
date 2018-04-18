import * as $ from "jquery";
import { Menu } from "../../Elements/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Highlight } from "./Highlight";
import { Reorder } from "./Reorder";


export class HighlightAndReorder {

  // Instances of other techniques used by this mixed one
  readonly highlight: Highlight;
  readonly reorder: Reorder;


  constructor () {
    this.highlight = new Highlight();
    this.reorder = new Reorder();
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
