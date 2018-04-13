import * as $ from "jquery";
import { Menu } from "../../Elements/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Highlight } from "./Highlight";
import { Reorder } from "./Reorder";


export class HighlightAndReorder extends Reorder {

  constructor () {
    super();
  }

  reset () {
    super.reset();
    Highlight.reset();
  }

  apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    super.apply(menus, policy, analyser);
    Highlight.apply(menus, policy, analyser);
  }
}
