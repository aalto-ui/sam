import { Menu } from "../../../elements/Menu";
import { DataManager } from "../../../data/DataManager";
import { ReorderItems } from "../ReorderItems";
import { Fold } from "../Fold";
import { NodeIndexOrderPolicy } from "../../policies/NodeIndexOrderPolicy";
import { Policy } from "../../policies/Policy";
import { Technique } from "../Technique";


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

  apply (menus: Menu[], policy: Policy, dataManager?: DataManager) {
    this.reorder.apply(menus, policy, dataManager);
    this.fold.apply(menus, this.naturalOrderPolicy);
  }
}
