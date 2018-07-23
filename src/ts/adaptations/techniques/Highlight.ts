import * as $ from "jquery";
import { Menu } from "../../elements/Menu";
import { DataManager } from "../../data/DataManager";
import { Item } from "../../elements/Item";
import { ItemWithScore, Policy } from "../policies/Policy";
import { Technique } from "./Technique";


// Discrete strength levels of the highlighting effect
// The values are used as additional classes, added to the the highlighted items
enum HighlightingLevel {
  High = "awm-high",
  Low = "awm-low"
}

// All highlighting levels classes
const HIGHLIGHTING_LEVELS_CLASSES: string[] = Object.keys(HighlightingLevel)
  .map((key) => {
    return HighlightingLevel[key];
  });


export class Highlight implements Technique<Policy> {

  private static readonly HIGHLIGHTED_ELEMENT_CLASS: string = "awm-highlighted";

  readonly name: string = "Highlight";

  // Internal set of items which should be highlighted at an high level
  // The set must be emptied and recomputed each time the technique is applied
  protected itemsToHighlightAtHighLevel: Set<Item>;


  constructor () {
    this.itemsToHighlightAtHighLevel = new Set();
  }


  private onNode (node: JQuery, level: HighlightingLevel) {
    node.addClass([Highlight.HIGHLIGHTED_ELEMENT_CLASS, level]);
  }

  protected onAllItems (items: Item[]) {
    for (let item of items) {
      let highlightingLevel = this.itemsToHighlightAtHighLevel.has(item)
                            ? HighlightingLevel.High
                            : HighlightingLevel.Low;

      this.onNode(item.node, highlightingLevel);
    }
  }

  reset () {
    // Simply remove highlighting and HL level classe
    let classesToRemove = HIGHLIGHTING_LEVELS_CLASSES;
    classesToRemove.push(Highlight.HIGHLIGHTED_ELEMENT_CLASS);

    $("." + Highlight.HIGHLIGHTED_ELEMENT_CLASS)
      .removeClass(classesToRemove);

    // Reset internal fields
    this.itemsToHighlightAtHighLevel.clear();
  }

  private getFilteredSortedItemWithScores (menus: Menu[], policy: Policy, dataManager?: DataManager): ItemWithScore[] {
    return policy.getSortedItemsWithScores(menus, dataManager)
      .filter((itemWithScore) => {
        return itemWithScore.score > 0;
      });
  }

  private getMaxNbItemsToHighlight (nbItems: number): number {
    return Math.floor(Math.sqrt(nbItems));
  }

  private getMaxNbItemsToHighlightInGroup (nbItemsInGroup: number): number {
    return Math.floor(Math.sqrt(nbItemsInGroup));
  }

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

  private splitAndApplyByGroup (items: Item[]) {
    let topItemsSplitByGroup = Item.splitAllByGroup(items);

    for (let sameGroupItems of topItemsSplitByGroup) {
      this.applyInGroup(sameGroupItems);
    }
  }

  private applyInGroup (sameGroupItems: Item[]) {
    // Splice the same group items to only reorder the top ones
    let totalNbGroupItems = sameGroupItems[0].parent.items.length;
    let nbTopSameGroupItemsToKeep = this.getMaxNbItemsToHighlightInGroup(totalNbGroupItems);
    let topSameGroupItems = sameGroupItems.splice(0, nbTopSameGroupItemsToKeep);

    this.onAllItems(topSameGroupItems);
  }

  apply (menus: Menu[], policy: Policy, dataManager?: DataManager) {
    let itemWithScores = this.getFilteredSortedItemWithScores(menus, policy, dataManager);

    // Only keep the top items to highlight them
    let totalNbItems = Menu.getAllMenusItems(menus).length;
    let nbTopItemsToKeep = this.getMaxNbItemsToHighlight(totalNbItems);

    let topItemWtihScores = itemWithScores.slice(0, nbTopItemsToKeep);
    let topItems = topItemWtihScores.map((itemScore) => {
      return itemScore.item;
    });

    this.computeItemsToHighlightAtHighLevel(topItemWtihScores);
    this.splitAndApplyByGroup(topItems);
  }
}
