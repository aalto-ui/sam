import { Menu } from "../../elements/Menu";
import { DataAnalyser } from "../../data/DataAnalyser";
import { Highlight } from "./Highlight";
import { ReorderItems } from "./ReorderItems";
import { Policy } from "../Policies/Policy";
import { Technique } from "./Technique";


export class HighlightAndReorderItems implements Technique<Policy> {

  readonly name: string = "Highlight + reorder items";

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

  apply (menus: Menu[], policy: Policy, analyser?: DataAnalyser) {
    this.highlight.apply(menus, policy, analyser);
    this.reorder.apply(menus, policy, analyser);
  }
}
