import * as $ from "jquery";
import { ReorderItems } from "./ReorderItems";
import { ReorderGroups } from "./ReorderGroups";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Highlight } from "./Highlight";
import { Policy } from "../Policies/Policy";
import { Technique } from "./Technique";



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

  apply (menus: Menu[], policy: Policy, analyser?: DataAnalyser) {
    this.highlight.apply(menus, policy, analyser);
    this.reorderItems.apply(menus, policy, analyser);
    this.reorderGroups.apply(menus, policy, analyser);
  }
}
