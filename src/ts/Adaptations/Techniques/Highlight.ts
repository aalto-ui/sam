import * as $ from "jquery";
import { AdaptiveElement } from "../../Elements/AdaptiveElement";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";
import { ItemWithScore, Policy } from "../Policies/Policy";
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


export class Highlight implements Technique {
  private static readonly HIGHLIGHTED_ELEMENT_CLASS: string = "awm-highlighted";


  constructor () { }


  private onNode (node: JQuery, level: HighlightingLevel) {
    node.addClass([Highlight.HIGHLIGHTED_ELEMENT_CLASS, level]);
  }

  private onAllItems (items: Item[], itemsToHighlightAtHighLevel: Set<Item>) {
    for (let item of items) {
      let highlightingLevel = itemsToHighlightAtHighLevel.has(item)
                            ? HighlightingLevel.High
                            : HighlightingLevel.Low;

      this.onNode(item.node, highlightingLevel);
    }
  }

  reset () {
    let classesToRemove = HIGHLIGHTING_LEVELS_CLASSES
    classesToRemove.push(Highlight.HIGHLIGHTED_ELEMENT_CLASS);

    $("." + Highlight.HIGHLIGHTED_ELEMENT_CLASS)
      .removeClass(classesToRemove);
  }

  private getMaxNbItemsToHighlight (nbItems: number): number {
    return Math.floor(Math.sqrt(nbItems));
  }

  private getMaxNbItemsToHighlightInGroup (nbItemsInGroup: number): number {
    return Math.floor(Math.sqrt(nbItemsInGroup));
  }

  private getItemsToHighlightAtHighLevel (itemsWithScores: ItemWithScore[]): Set<Item> {
    // TODO: really implement something here
    // DEBUG: right now, the top (at most) 2 items are highlighted at high level

    let itemsToHighlightAtHighLevel = new Set();

    for (let i = 0; i < Math.min(2, itemsWithScores.length); i++) {
      itemsToHighlightAtHighLevel.add(itemsWithScores[i].item);
    }

    return itemsToHighlightAtHighLevel;
  }

  apply (menus: Menu[], policy: Policy, analyser?: DataAnalyser) {
    let totalNbItems = Menu.getAllMenusItems(menus).length;

    let itemScores = policy.getSortedItemsWithScores(menus, analyser)
      .filter((itemScore) => {
        let item = itemScore.item;

        let itemStats = analyser.getItemClickAnalysis().itemStats[item.id];
        return itemStats !== undefined && itemStats.nbClicks > 0;
      });

    let nbTopItemsToKeep = this.getMaxNbItemsToHighlight(totalNbItems);
    let topItemsWithScores = itemScores.slice(0, nbTopItemsToKeep);
    let topItems = topItemsWithScores.map((itemScore) => {
      return itemScore.item;
    });

    let itemsToHighlightAtHighLevel = this.getItemsToHighlightAtHighLevel(topItemsWithScores);

    let topItemsSplitByGroup = Item.splitAllByGroup(topItems);
    for (let sameGroupItems of topItemsSplitByGroup) {
      let totalNbGroupItems = sameGroupItems[0].parent.items.length;
      let nbTopSameGroupItemsToKeep = this.getMaxNbItemsToHighlightInGroup(totalNbGroupItems);
      let topSameGroupItems = sameGroupItems.splice(0, nbTopSameGroupItemsToKeep);

      this.onAllItems(topSameGroupItems, itemsToHighlightAtHighLevel);
    }
  }
}
