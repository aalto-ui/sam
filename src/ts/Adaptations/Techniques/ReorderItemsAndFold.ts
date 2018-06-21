import * as $ from "jquery";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { ReorderItems } from "./ReorderItems";
import { Fold } from "./Fold";
import { NodeIndexOrderPolicy } from "../Policies/NodeIndexOrderPolicy";
import { Policy } from "../Policies/Policy";
import { Technique } from "./Technique";


export class ReorderItemsAndFold implements Technique<Policy> {

  readonly name: string = "Reorder items + fold";

  // Instances of other techniques used by this mixed one
  readonly reorder: ReorderItems;
  readonly fold: Fold;

  readonly naturalOrderPolicy: NodeIndexOrderPolicy;


  constructor () {
    this.reorder = new ReorderItems();
    this.fold = new Fold();

    this.naturalOrderPolicy = new NodeIndexOrderPolicy();
  }

  reset () {
    this.fold.reset();
    this.reorder.reset();
  }

  apply (menus: Menu[], policy: Policy, analyser?: DataAnalyser) {
    this.reorder.apply(menus, policy, analyser);
    this.fold.apply(menus, this.naturalOrderPolicy);
  }
}
