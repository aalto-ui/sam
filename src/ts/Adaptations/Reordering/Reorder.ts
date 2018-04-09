import * as $ from "jquery";
import { Adaptation } from "../Adaptation";
import { AdaptiveElement } from "../../Menus/AdaptiveElement";
import { Menu } from "../../Menus/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { DataAnalyser } from "../../UserData/DataAnalyser";


// Type alias for an element position
type Position = number;


export class Reorder extends Adaptation {
  private static readonly REORDERED_ELEMENT_CLASS: string = "awm-reordered";

  private static initialPositions: Map<HTMLElement, number> = new Map();


  // For internal use only
  // Simply move a node among its siblings at a given index, with no side effect
  private static reinsertNode (node: JQuery, index: Position) {
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
    Reorder.initialPositions.set(node[0], index);
    Reorder.reinsertNode(node, index);

    node.addClass(this.REORDERED_ELEMENT_CLASS);
  }

  private static moveNodeBack (node: JQuery) {
    if (! Reorder.initialPositions.has(node[0])) {
      console.error("moveNodeback failed: no initial position found");
      return;
    }

    let initialPosition = Reorder.initialPositions.get(node[0]);
    Reorder.initialPositions.delete(node[0]);
    Reorder.reinsertNode(node, initialPosition);

    node.removeClass(Reorder.REORDERED_ELEMENT_CLASS);
  }

  static moveElement (element: AdaptiveElement, index: Position) {
    Reorder.moveNode(element.node, index);
  }

  static moveElementBack (element: AdaptiveElement) {
    Reorder.moveNodeBack(element.node);
  }

  static moveAllElements (elements: AdaptiveElement[]) {
    // The index in the list of elements is passed as the index (2nd) parameter
    elements.forEach(this.moveElement);
  }

  static moveAllElementsBack (elements: AdaptiveElement[]) {
    elements.forEach(this.moveElementBack);
  }

  static reset () {
    for (let node of Reorder.initialPositions.keys()) {
      Reorder.moveNodeBack($(node));
    }
  }

  static apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    let itemsToHighlight = policy.getItemList(menus, analyser);
    this.moveAllElements(itemsToHighlight);
  }
}
