import * as $ from "jquery";
import { AdaptationTechnique } from "../Adaptation";
import { AdaptiveElement } from "../../Elements/AdaptiveElement";
import { Menu } from "../../Elements/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";


export class Highlight implements AdaptationTechnique {
  private static readonly HIGHLIGHTED_ELEMENT_CLASS: string = "awm-highlighted";


  constructor () { }


  private static onNode (node: JQuery) {
    node.addClass(this.HIGHLIGHTED_ELEMENT_CLASS);
  }

  private static offNode (node: JQuery) {
    node.removeClass(this.HIGHLIGHTED_ELEMENT_CLASS);
  }

  static onElement (element: AdaptiveElement) {
    Highlight.onNode(element.node);
  }

  static offElement (element: AdaptiveElement) {
    Highlight.offNode(element.node);
  }

  static onAllElements (elements: AdaptiveElement[]) {
    elements.forEach(this.onElement);
  }

  static offAllElements (elements: AdaptiveElement[]) {
    elements.forEach(this.offElement);
  }

  reset () {
    $("." + Highlight.HIGHLIGHTED_ELEMENT_CLASS).removeClass(Highlight.HIGHLIGHTED_ELEMENT_CLASS);
  }

  private getMaxNbItemsToHighlight (nbItems: number): number {
    return Math.floor(Math.sqrt(nbItems));
  }

  private getMaxNbItemsToHighlightInGroup (nbItemsInGroup: number): number {
    return Math.floor(Math.sqrt(nbItemsInGroup));
  }

  apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    let items = policy.getItemList(menus, analyser)
      .filter((item) => {
        let itemStats = analyser.getItemClickAnalysis().itemStats[item.id];
        return itemStats !== undefined && itemStats.nbClicks > 0;
      });

    let nbTopItemsToKeep = this.getMaxNbItemsToHighlight(items.length);
    let topItems = items.slice(0, nbTopItemsToKeep);

    let topItemsSplitByGroup = Item.splitAllByGroup(items);
    for (let sameGroupItems of topItemsSplitByGroup) {
      let nbTopSameGroupItemsToKeep = this.getMaxNbItemsToHighlightInGroup(sameGroupItems.length);
      let topSameGroupItems = sameGroupItems.splice(0, nbTopSameGroupItemsToKeep);

      Highlight.onAllElements(topSameGroupItems);
    }
  }
}
