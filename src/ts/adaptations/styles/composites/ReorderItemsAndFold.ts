/** @module adaptation */

import { MenuManager } from "../../../elements/MenuManager";
import { DataManager } from "../../../data/DataManager";
import { ReorderItems } from "../ReorderItems";
import { Fold } from "../Fold";
import { NodeIndexOrderPolicy } from "../../policies/NodeIndexOrderPolicy";
import { TargetPolicy } from "../../policies/TargetPolicy";
import { AdaptationStyle } from "../AdaptationStyle";


export class ReorderItemsAndFold implements AdaptationStyle {

  // ============================================================ PROPERTIES ===

  readonly name: string = "Reorder items + fold";

  // Instances of other styles used by this mixed one
  private readonly reorder: ReorderItems;
  private readonly fold: Fold;

  private readonly naturalOrderPolicy: NodeIndexOrderPolicy;


  // =========================================================== CONSTRUCTOR ===

  constructor () {
    this.reorder = new ReorderItems();
    this.fold = new Fold();

    this.naturalOrderPolicy = new NodeIndexOrderPolicy();
  }


  // =============================================================== METHODS ===

  cancel () {
    this.fold.cancel();
    this.reorder.cancel();
  }

  apply (menuManager: MenuManager, policy: TargetPolicy, dataManager?: DataManager) {
    this.reorder.apply(menuManager, policy, dataManager);
    this.fold.apply(menuManager, this.naturalOrderPolicy);
  }
}
