import * as $ from "jquery";
import { AdaptationTechnique } from "../Adaptation";
import { Menu } from "../../Elements/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Reorder } from "./Reorder";
import { Fold } from "./Fold";


export class ReorderAndFold implements AdaptationTechnique {

  // Instances of other techniques used by this mixed one
  readonly reorder: Reorder;
  readonly fold: Fold;


  constructor () {
    this.reorder = new Reorder();
    this.fold = new Fold();
  }

  reset () {
    this.fold.reset();
    this.reorder.reset();
  }

  apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    this.reorder.apply(menus, policy, analyser);
    this.fold.apply(menus, policy, analyser);
  }
}
