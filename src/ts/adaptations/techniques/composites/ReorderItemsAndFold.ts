import { MenuManager } from "../../../elements/MenuManager";
import { DataManager } from "../../../data/DataManager";
import { ReorderItems } from "../ReorderItems";
import { Fold } from "../Fold";
import { NodeIndexOrderPolicy } from "../../policies/NodeIndexOrderPolicy";
import { Policy } from "../../policies/Policy";
import { Technique } from "../Technique";


export class ReorderItemsAndFold implements Technique {

  /*************************************************************** PROPERTIES */

  readonly name: string = "Reorder items + fold";

  // Instances of other techniques used by this mixed one
  private readonly reorder: ReorderItems;
  private readonly fold: Fold;

  private readonly naturalOrderPolicy: NodeIndexOrderPolicy;


  /************************************************************** CONSTRUCTOR */

  constructor () {
    this.reorder = new ReorderItems();
    this.fold = new Fold();

    this.naturalOrderPolicy = new NodeIndexOrderPolicy();
  }


  /****************************************************************** METHODS */

  reset () {
    this.fold.reset();
    this.reorder.reset();
  }

  apply (menuManager: MenuManager, policy: Policy, dataManager?: DataManager) {
    this.reorder.apply(menuManager, policy, dataManager);
    this.fold.apply(menuManager, this.naturalOrderPolicy);
  }
}
