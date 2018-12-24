import * as $ from "jquery";
import { MenuManager } from "../../elements/MenuManager";
import { DataManager } from "../../data/DataManager";
import { Item } from "../../elements/Item";
import { TargetPolicy } from "../policies/TargetPolicy";
import { AdaptationStyle } from "./AdaptationStyle";


export class Fold implements AdaptationStyle {

  // ============================================================ PROPERTIES ===

  /**
   * HTML class of a folded folder element (containing hidden items).
   */
  static readonly IS_FOLDED_CLASS: string = "awm-folded";

  /**
   * HTML class of a folder switch button (to open/close the folder).
   */
  static readonly SWITCH_FOLD_BUTTON_CLASS: string = "awm-fold-button";

  /**
   * HTML class of a foldable element (contained by a folder).
   */
  static readonly FOLDABLE_ELEMENT_CLASS: string = "awm-foldable";

  /**
   * HTML class of a folder element.
   */
  static readonly FOLDER_ELEMENT_CLASS: string = "awm-folder";

  readonly name: string = "Fold";

  /**
   * List of folder nodes.
   * The list must be emptied and recomputed each time the technique is applied.
   */
  private folderNodes: JQuery[];


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of Fold.
   */
  constructor () {
    this.folderNodes = [];
  }


  // =============================================================== METHODS ===


  // ===========================================================================
  // Folding and unfolding
  // ===========================================================================

  /**
   * Unfold the folder represented by the given node.
   *
   * @param  folderNode The folder node to unfold.
   */
  private unfold (folderNode: JQuery) {
    folderNode.removeClass(Fold.IS_FOLDED_CLASS);

    folderNode
      .find("." + Fold.SWITCH_FOLD_BUTTON_CLASS)
      .html("Show less");
  }

  /**
   * Fold the folder represented by the given node.
   *
   * @param  folderNode The folder node to fold.
   */
  private fold (folderNode: JQuery) {
    folderNode.addClass(Fold.IS_FOLDED_CLASS);

    folderNode
      .find("." + Fold.SWITCH_FOLD_BUTTON_CLASS)
      .html("Show more");
  }

  /**
   * Switch whether the folder represented by the given node is folded or unfolded.
   *
   * @param  folderNode The folder node to fold or unfold.
   */
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

  /**
   * Create and return a folder switch button, for the given folder node.
   *
   * @param  folderNode The folder node the button should fold and unfold.
   * @return            The new button node.
   */
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

  /**
   * Create and append a folder switch button to the given folder node.
   *
   * @param  folderNode The folder node to add the switch button to.
   */
  private createAndAppendFoldButtonToFolder (folderNode: JQuery) {
    let button = this.createSwitchFoldButton(folderNode);

    // Append the button after the last folded item
    folderNode
      .find("." + Fold.FOLDABLE_ELEMENT_CLASS)
      .last()
      .after(button);
  }


  // ===========================================================================
  // Apply s
  // ===========================================================================

  /**
   * Group the given items under a new folder, by moving them to a new container,
   * and adding a button to switch the folder state.
   *
   * Note: new folders are folded by default (its content is hidden).
   *
   * @param  items The list of items to group under a single new folder.
   */
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

  /**
   * Return the maximum number of items which must be kept visible in a group,
   * i.e. which will not be put into a folder.
   *
   * @param  nbItems The total number of items in the group.
   * @return         The maximum number of items to keep displayed in the group.
   */
  private getMaxNbItemsToDisplayInGroup (nbItemsInGroup: number): number {
    return Math.ceil(Math.sqrt(nbItemsInGroup));
  }

  /**
   * Split all the given items by their group, and fold them group by group
   * (using [[applyInGroup]]).
   *
   * @param  items The sorted list of items to fold.
   */
  private splitAndApplyByGroup (items: Item[]) {
    let topItemsSplitByGroup = Item.splitAllByGroup(items);

    for (let sameGroupItems of topItemsSplitByGroup) {
      this.applyInGroup(sameGroupItems);
    }
  }

  /**
   * Fold a certain subset of the given items, assuming they all belong to the same group.
   *
   * The subset excludes a certain number of leading items in the given list,
   * given by [[getMaxNbItemsToDisplayInGroup]]. Those items are left displayed
   * above/before the folder, which contain all the remaining items (in their original order).
   *
   * @param  sameGroupItems The sorted list of items located in the same group.
   */
  private applyInGroup (sameGroupItems: Item[]) {
    // Only keep items which must be moved into the folded menu (i.e. remove the top ones from the array)
    let totalNbGroupItems = sameGroupItems[0].parent.items.length;
    let nbItemToKeep = this.getMaxNbItemsToDisplayInGroup(totalNbGroupItems);
    sameGroupItems.splice(0, nbItemToKeep);

    this.makeFolder(sameGroupItems);
  }

  apply (menuManager: MenuManager, policy: TargetPolicy, dataManager?: DataManager) {
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
