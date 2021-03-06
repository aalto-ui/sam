/** @module adaptation */

import { ReorderItems } from "../ReorderItems";
import { ReorderGroups } from "./../ReorderGroups";
import { MenuManager } from "../../../elements/MenuManager";
import { DataManager } from "../../../data/DataManager";
import { Highlight } from "../Highlight";
import { TargetPolicy } from "../../policies/TargetPolicy";
import { AdaptationStyle } from "../AdaptationStyle";


export class HighlightAndReorderAll implements AdaptationStyle {

  // ============================================================ PROPERTIES ===

  readonly name: string = "Highlight + reorder items & groups";

  // Instances of other styles used by this mixed one
  private readonly highlight: Highlight;
  private readonly reorderItems: ReorderItems;
  private readonly reorderGroups: ReorderGroups;


  // =========================================================== CONSTRUCTOR ===

  constructor () {
    this.highlight = new Highlight();
    this.reorderItems = new ReorderItems();
    this.reorderGroups = new ReorderGroups();
  }


  // =============================================================== METHODS ===

  cancel () {
    this.reorderGroups.cancel();
    this.reorderItems.cancel();
    this.highlight.cancel();
  }

  apply (menuManager: MenuManager, policy: TargetPolicy, dataManager?: DataManager) {
    this.highlight.apply(menuManager, policy, dataManager);
    this.reorderItems.apply(menuManager, policy, dataManager);
    this.reorderGroups.apply(menuManager, policy, dataManager);
  }
}
