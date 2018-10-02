import * as $ from "jquery";
import { MenuManager } from "../../elements/MenuManager";
import { DataManager } from "../../data/DataManager";
import { Item } from "../../elements/Item";
import { Policy } from "../policies/Policy";
import { Technique } from "./Technique";


export class Fold implements Technique {

  // ============================================================ PROPERTIES ===

  static readonly IS_FOLDED_CLASS: string = "awm-folded";
  static readonly SWITCH_FOLD_BUTTON_CLASS: string = "awm-fold-button";
  static readonly FOLDABLE_ELEMENT_CLASS: string = "awm-foldable";
  static readonly FOLDER_ELEMENT_CLASS: string = "awm-folder";

  readonly name: string = "Fold";

  private folderNodes: JQuery[];


  // =========================================================== CONSTRUCTOR ===

  constructor () {
    this.folderNodes = [];
  }


  // =============================================================== METHODS ===


  // ===========================================================================
  // Folding and unfolding
  // ===========================================================================

  private unfold (folderNode: JQuery) {
    folderNode.removeClass(Fold.IS_FOLDED_CLASS);

    folderNode
      .find("." + Fold.SWITCH_FOLD_BUTTON_CLASS)
      .html("Show less");
  }

  private fold (folderNode: JQuery) {
    folderNode.addClass(Fold.IS_FOLDED_CLASS);

    folderNode
      .find("." + Fold.SWITCH_FOLD_BUTTON_CLASS)
      .html("Show more");
  }

  private switchFoldState (folderNode: JQuery) {
    if (folderNode.hasClass(Fold.IS_FOLDED_CLASS)) {
      this.unfold(folderNode);
    }
    else {
      this.fold(folderNode);
    }
  }


  // ===========================================================================
  // Fold button
  // ===========================================================================

  private createSwitchFoldButton (folderNode: JQuery): JQuery {
    let button = $("<button>")
      .addClass(Fold.SWITCH_FOLD_BUTTON_CLASS)
      .attr("type", "button");

    // Handle clicks on the button to fold or unfold the folder
    button.on("click", () => {
      this.switchFoldState(folderNode);
    });

    return button;
  }

  private createAndAppendFoldButtonToFolder (folderNode: JQuery) {
    let button = this.createSwitchFoldButton(folderNode);

    // Append the button after the last folded item
    folderNode
      .find("." + Fold.FOLDABLE_ELEMENT_CLASS)
      .last()
      .after(button);
  }


  // ===========================================================================
  // Apply technique
  // ===========================================================================

  private makeFolder (items: Item[]) {
    // Tag items as foldables
    for (let item of items) {
      item.node.addClass(Fold.FOLDABLE_ELEMENT_CLASS);
    }

    // Tag the parent group node as the folder
    let folderNode = items[0].parent.node;
    folderNode.addClass(Fold.FOLDER_ELEMENT_CLASS);

    this.folderNodes.push(folderNode);

    // Append a fold button to the folder
    this.createAndAppendFoldButtonToFolder(folderNode);

    // By default, start with a folded folder
    this.fold(folderNode);
  }

  private getMaxNbItemsToDisplayInGroup (nbItemsInGroup: number): number {
    return Math.ceil(Math.sqrt(nbItemsInGroup));
  }

  private splitAndApplyByGroup (items: Item[]) {
    let topItemsSplitByGroup = Item.splitAllByGroup(items);

    for (let sameGroupItems of topItemsSplitByGroup) {
      this.applyInGroup(sameGroupItems);
    }
  }

  private applyInGroup (sameGroupItems: Item[]) {
    // Only keep items which must be moved into the folded menu (i.e. remove the top ones from the array)
    let totalNbGroupItems = sameGroupItems[0].parent.items.length;
    let nbItemToKeep = this.getMaxNbItemsToDisplayInGroup(totalNbGroupItems);
    sameGroupItems.splice(0, nbItemToKeep);

    this.makeFolder(sameGroupItems);
  }

  apply (menuManager: MenuManager, policy: Policy, dataManager?: DataManager) {
    let items = policy.getSortedItems(menuManager, dataManager);

    this.splitAndApplyByGroup(items);
  }


  // ===========================================================================
  // Reset technique
  // ===========================================================================

  reset () {
    for (let folderNode of this.folderNodes) {
      // Remove foldable classes
      folderNode
        .find("." + Fold.FOLDABLE_ELEMENT_CLASS)
        .removeClass(Fold.FOLDER_ELEMENT_CLASS);

      // Remove the switch fold button
      folderNode
        .find("." + Fold.SWITCH_FOLD_BUTTON_CLASS)
        .remove();

      // Remove the folder class
      folderNode.removeClass(Fold.FOLDER_ELEMENT_CLASS);
    }

    this.folderNodes = [];
  }
}
