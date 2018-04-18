import * as $ from "jquery";
import { AdaptationTechnique } from "../Adaptation";
import { AdaptiveElement } from "../../Elements/AdaptiveElement";
import { Menu } from "../../Elements/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { ItemGroup } from "../../Elements/ItemGroup";
import { Item } from "../../Elements/Item";


// Type alias for an element position
type Position = number;


export class Reorder implements AdaptationTechnique {
  private static readonly REORDERED_ELEMENT_CLASS: string = "awm-reordered";

  // Map from HTML parent elements to JQuery children in their original order
  // This is internally used to restore the reset the reordering
  private childrenInOriginalOrder: Map<HTMLElement, JQuery>;

  constructor () {
    this.childrenInOriginalOrder = new Map();
  }

  // For internal use only
  // Simply move a node among its siblings at a given index, with no side effect
  private static reinsertNode (node: JQuery, index: Position) {
    if (index === node.index()) {
      return;
    }

    if (index === 0) {
      node.parent()
        .prepend(node);
    }

    else {
      node.parent()
        .children().eq(index - 1)
        .after(node);
    }
  }

  private moveNode (node: JQuery, index: Position) {
    Reorder.reinsertNode(node, index);
    node.addClass(Reorder.REORDERED_ELEMENT_CLASS);
  }

  private moveElement (element: AdaptiveElement, index: Position) {
    let parentNode = element.node.parent();
    if (! this.childrenInOriginalOrder.has(parentNode[0])) {
      let orderedChildNodes = parentNode.children();
      this.childrenInOriginalOrder.set(parentNode[0], orderedChildNodes);
    }

    this.moveNode(element.node, index);
  }

  private moveAllElements (elements: AdaptiveElement[]) {
    elements.forEach((element, index) => {
      this.moveElement(element, index);
    });
  }

  reset () {
    for (let [parent, orderedChildNodes] of this.childrenInOriginalOrder) {
      let parentNode = $(parent);
      orderedChildNodes.each((_, element) => {
        parentNode.append(element);
      });
    }

    this.childrenInOriginalOrder.clear();
    $("." + Reorder.REORDERED_ELEMENT_CLASS).removeClass(Reorder.REORDERED_ELEMENT_CLASS);
  }

  apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    let itemsToReorder = policy.getItemList(menus, analyser);

    // Reorder items independetly for each group of items
    let groupWiseIterator = this.getGroupWiseItemIterator(itemsToReorder);
    for (let groupOrderedItemList of groupWiseIterator) {
      this.moveAllElements(groupOrderedItemList);
    }
  }
}
