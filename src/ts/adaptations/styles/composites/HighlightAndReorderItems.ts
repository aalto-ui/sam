/** @module adaptation */

import { MenuManager } from "../../../elements/MenuManager";
import { DataManager } from "../../../data/DataManager";
import { Highlight } from "../Highlight";
import { ReorderItems } from "../ReorderItems";
import { TargetPolicy } from "../../policies/TargetPolicy";
import { AdaptationStyle } from "../AdaptationStyle";


export class HighlightAndReorderItems implements AdaptationStyle {

  // ============================================================ PROPERTIES ===

  readonly name: string = "Highlight + reorder items";

  // Instances of other styles used by this mixed one
  private readonly highlight: Highlight;
  private readonly reorder: ReorderItems;


  // =========================================================== CONSTRUCTOR ===

  constructor () {
    this.highlight = new Highlight();
    this.reorder = new ReorderItems();
  }


  // =============================================================== METHODS ===

  reset () {
    this.reorder.reset();
    this.highlight.reset();
  }

  apply (menuManager: MenuManager, policy: TargetPolicy, dataManager?: DataManager) {
    this.highlight.apply(menuManager, policy, dataManager);
    this.reorder.apply(menuManager, policy, dataManager);
  }
}
