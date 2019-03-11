/** @module adaptation */

import * as $ from "jquery";
import { MenuManager } from "../../elements/MenuManager";
import { DataManager } from "../../data/DataManager";
import { Item } from "../../elements/Item";
import { ItemWithScore, TargetPolicy } from "../policies/TargetPolicy";
import { AdaptationStyle } from "./AdaptationStyle";


/**
 * Levels of highlighting.
 *
 * A higher level should be associated with a more important visual cue,
 * e.g. a more opaque background color.
 */
enum HighlightingLevel {
  High = "sam-high",
  Low = "sam-low"
}

/**
 * List of the HTML classes of highlighted elements, of each highlighting level.
 * They are equal to the value of the related enum options.
 */
const HIGHLIGHTING_LEVELS_CLASSES: string[] = Object.keys(HighlightingLevel)
  .map((key) => {
    return HighlightingLevel[key];
  });


export class Highlight implements AdaptationStyle {

  // ============================================================ PROPERTIES ===

  /**
   * HTML class of a highlighted element.
   *
   * This class is generic, and complementary to level-specific classes
   * (see [[HIGHLIGHTING_LEVELS_CLASSES]]).
   */
  static readonly HIGHLIGHTED_ELEMENT_CLASS: string = "sam-highlighted";

  readonly name: string = "Highlight";

  /**
   * Set of items which must be highlighted at high level.
   * The set must be emptied and recomputed each time the style is applied.
   */
  protected itemsToHighlightAtHighLevel: Set<Item>;


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of Highlight.
   */
  constructor () {
    this.itemsToHighlightAtHighLevel = new Set();
  }


  // =============================================================== METHODS ===


  // ===========================================================================
  // Item highlighting
  // ===========================================================================

  /**
   * Highlight the given node at the given level, by adding appropriate HTML classes.
   *
   * @param  node  The node to highlight.
   * @param  level The level to highlight the node at.
   */
  private onNode (node: JQuery, level: HighlightingLevel) {
    node.addClass([Highlight.HIGHLIGHTED_ELEMENT_CLASS, level]);
  }

  /**
   * Highlight all the given nodes,
   * according to levels specified by [[itemsToHighlightAtHighLevel]].
   *
   * @param  items The list of items to highlight.
   */
  protected onAllItems (items: Item[]) {
    for (let item of items) {
      let highlightingLevel = this.itemsToHighlightAtHighLevel.has(item)
                            ? HighlightingLevel.High
                            : HighlightingLevel.Low;

      this.onNode(item.node, highlightingLevel);
    }
  }


  // ===========================================================================
  // Apply style
  // ===========================================================================

  /**
   * Use the given policy to score and sort the items of all the menus to adapt,
   * and filter out any item which has a null (0) score.
   *
   * @param  menuManager The menu manager containing the menus with items to highlight.
   * @param  policy      The policy to use to score the items.
   * @param  dataManager The data manager containing data for the policy.
   * @return             A sorted and filtered list of items.
   */
  private getFilteredSortedItemWithScores (menuManager: MenuManager, policy: TargetPolicy, dataManager?: DataManager): ItemWithScore[] {
    return policy
      .getSortedItemsWithScores(menuManager, dataManager)
      .filter((itemWithScore) => {
        return itemWithScore.score > 0;
      });
  }

  /**
   * Return the maximum number of items which can be highlighted in a menu.
   *
   * @param  nbItems The total number of items in the menu.
   * @return         The maximum number of items to highlight in the menu.
   */
  private getMaxNbItemsToHighlight (nbItems: number): number {
    return Math.floor(Math.sqrt(nbItems));
  }

  /**
   * Return the maximum number of items which can be highlighted in a group.
   *
   * @param  nbItemsInGroup The total number of items in the group.
   * @return                The maximum number of items to highlight in the group.
   */
  private getMaxNbItemsToHighlightInGroup (nbItemsInGroup: number): number {
    return Math.floor(Math.sqrt(nbItemsInGroup));
  }

  /**
   * Compute the set of items which must be highlighted at high level.
   * The (internal) set is cleared beforehand.
   *
   * @param  itemWithScores Sorted list of items with their scores.
   */
  private computeItemsToHighlightAtHighLevel (itemWithScores: ItemWithScore[]) {
    this.itemsToHighlightAtHighLevel.clear();

    // TODO: decide on a better policy to select which items to keep here!
    // Currently, only the at most two items with the highest, non-null scores are selected
    for (let i = 0; i < Math.min(2, itemWithScores.length); i++) {
      let itemWithScore = itemWithScores[i];

      if (itemWithScore.score === 0) {
        continue;
      }

      this.itemsToHighlightAtHighLevel.add(itemWithScore.item);
    }
  }

  /**
   * Highlight all the given items, assuming they all belong to the same group.
   *
   * @param  sameGroupItems The sorted list of items located in the same group.
   */
  private applyInGroup (sameGroupItems: Item[]) {
    // Splice the same group items to only reorder the top ones
    let totalNbGroupItems = sameGroupItems[0].parent.items.length;
    let nbTopSameGroupItemsToKeep = this.getMaxNbItemsToHighlightInGroup(totalNbGroupItems);
    let topSameGroupItems = sameGroupItems.splice(0, nbTopSameGroupItemsToKeep);

    this.onAllItems(topSameGroupItems);
  }

  /**
   * Split all the given items by their group, and highlight them group by group
   * (using [[applyInGroup]]).
   *
   * @param  items The sorted list of items to highlight.
   */
  private splitAndApplyByGroup (items: Item[]) {
    let topItemsSplitByGroup = Item.splitAllByGroup(items);

    for (let sameGroupItems of topItemsSplitByGroup) {
      this.applyInGroup(sameGroupItems);
    }
  }

  apply (menuManager: MenuManager, policy: TargetPolicy, dataManager?: DataManager) {
    let itemWithScores = this.getFilteredSortedItemWithScores(menuManager, policy, dataManager);

    // Only keep the top items to highlight them
    let totalNbItems = menuManager.getNbItems();
    let nbTopItemsToKeep = this.getMaxNbItemsToHighlight(totalNbItems);

    let topItemWtihScores = itemWithScores.slice(0, nbTopItemsToKeep);
    let topItems = topItemWtihScores.map((itemScore) => {
      return itemScore.item;
    });

    this.computeItemsToHighlightAtHighLevel(topItemWtihScores);
    this.splitAndApplyByGroup(topItems);
  }


  // ===========================================================================
  // Cancel style
  // ===========================================================================

  cancel () {
    // Simply remove highlighting and HL level classe
    let classesToRemove = HIGHLIGHTING_LEVELS_CLASSES;
    classesToRemove.push(Highlight.HIGHLIGHTED_ELEMENT_CLASS);

    $("." + Highlight.HIGHLIGHTED_ELEMENT_CLASS)
      .removeClass(classesToRemove);

    // Reset internal fields
    this.itemsToHighlightAtHighLevel.clear();
  }
}
