import * as $ from "jquery";
import { AdaptationTechnique } from "../Adaptation";
import { AdaptiveElement } from "../../Menus/AdaptiveElement";
import { Menu } from "../../Menus/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { DataAnalyser } from "../../UserData/DataAnalyser";
import { ItemGroup } from "../../Menus/ItemGroup";
import { Item } from "../../Menus/Item";


// Type alias for an element position
type Position = number;


export class Reorder extends AdaptationTechnique {
  private static readonly REORDERED_ELEMENT_CLASS: string = "awm-reordered";

  //
  private static childrenInOriginalOrder: Map<HTMLElement, JQuery> = new Map();


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

  private static moveNode (node: JQuery, index: Position) {
    Reorder.reinsertNode(node, index);
    node.addClass(Reorder.REORDERED_ELEMENT_CLASS);
  }

  static moveElement (element: AdaptiveElement, index: Position) {
    let parentNode = element.node.parent();
    if (! Reorder.childrenInOriginalOrder.has(parentNode[0])) {
      let orderedChildNodes = parentNode.children();
      Reorder.childrenInOriginalOrder.set(parentNode[0], orderedChildNodes);
    }

    Reorder.moveNode(element.node, index);
  }

  static moveAllElements (elements: AdaptiveElement[]) {
    // The index in the list of elements is passed as the index (2nd) parameter
    elements.forEach(Reorder.moveElement);
  }

  static reset () {
    for (let [parent, orderedChildNodes] of Reorder.childrenInOriginalOrder) {
      let parentNode = $(parent);
      orderedChildNodes.each((_, element) => {
        parentNode.append(element);
      });
    }

    Reorder.childrenInOriginalOrder.clear();
    $("." + Reorder.REORDERED_ELEMENT_CLASS).removeClass(Reorder.REORDERED_ELEMENT_CLASS);
  }

  static apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    let itemsToHighlight = policy.getItemList(menus, analyser);
    Reorder.moveAllElements(itemsToHighlight);
  }
}
