import * as $ from "jquery";
import { AdaptationTechnique } from "../Adaptation";
import { Menu } from "../../Menus/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { DataAnalyser } from "../../UserData/DataAnalyser";
import { Highlight } from "./Highlight";
import { Reorder } from "./Reorder";


export class HighlightAndReorder extends AdaptationTechnique {

  static reset () {
    Highlight.reset();
    Reorder.reset();
  }

  static apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    Reorder.apply(menus, policy, analyser);
    Highlight.apply(menus, policy, analyser);
  }
}
