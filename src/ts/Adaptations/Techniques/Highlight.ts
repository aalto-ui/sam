import * as $ from "jquery";
import { AdaptationTechnique } from "../Adaptation";
import { AdaptiveElement } from "../../Elements/AdaptiveElement";
import { Menu } from "../../Elements/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";


export class Highlight implements AdaptationTechnique {
  private static readonly HIGHLIGHTED_ELEMENT_CLASS: string = "awm-highlighted";

  // Global maximum number of items to highlight
  maxNbHighlightedItems: number = 3;

  // Maximum number of items to highlight per group
  maxNbHighlightedItemsPerGroup: number = 2;

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

  apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    let items = policy.getItemList(menus, analyser)
      .slice(0, this.maxNbHighlightedItems);

    let itemsSplitByGroup = Item.splitAllByGroup(items);
    for (let sameGroupItems of itemsSplitByGroup) {
      // Only keep at most maxNbDisplayedItemsPerGroup items
      let remainingItems = sameGroupItems.splice(0, this.maxNbHighlightedItemsPerGroup);

      Highlight.onAllElements(remainingItems);
    }
  }
}
