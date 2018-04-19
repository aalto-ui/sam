import * as $ from "jquery";
import { AdaptationTechnique } from "../Adaptation";
import { ReorderItems } from "./ReorderItems";
import { ReorderGroups } from "./ReorderGroups";
import { Menu } from "../../Elements/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { ItemGroupListPolicy } from "../Policies/ItemGroupListPolicy";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Highlight } from "./Highlight";



export class HighlightAndReorderAll implements AdaptationTechnique {

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

  apply (menus: Menu[], policy: ItemListPolicy & ItemGroupListPolicy, analyser?: DataAnalyser) {
    this.highlight.apply(menus, policy, analyser);
    this.reorderItems.apply(menus, policy, analyser);
    this.reorderGroups.apply(menus, policy, analyser);
  }
}
