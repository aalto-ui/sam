import * as $ from "jquery";
import { AdaptationTechnique, AdaptationPolicy } from "../Adaptation";
import { AdaptiveElement } from "../../Elements/AdaptiveElement";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { ItemGroup } from "../../Elements/ItemGroup";
import { Item } from "../../Elements/Item";


// Type alias for an element position
type Position = number;


export abstract class Reorder implements AdaptationTechnique {
  protected static readonly REORDERED_ELEMENT_CLASS: string = "awm-reordered";

  // Maximum number of items to reorder
  maxNbItems: number = 3;

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
    // Save the parent HTML element, it it has never been seen yet
    let parentNode = element.node.parent();
    if (! this.childrenInOriginalOrder.has(parentNode[0])) {
      let orderedChildNodes = parentNode.children();
      this.childrenInOriginalOrder.set(parentNode[0], orderedChildNodes);
    }

    // Shift the index according to the actual indices of adaptive elements
    // sibling nodes of the same type; it can prevent breaking some designs,
    // where there are non-menu nodes among the siblings of reordered element nodes
    let type = element.getType();
    let sortedShiftedIndices = parentNode.children(`[${AdaptiveElement.TAG_PREFIX}type=${type}]`)
      .get()
      .map((element) => {
        return $(element).index();
      })
      .sort();

    this.moveNode(element.node, sortedShiftedIndices[index]);
  }

  protected moveAllElements (elements: AdaptiveElement[]) {
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

  abstract apply (menus: Menu[], policy: AdaptationPolicy, analyser?: DataAnalyser);
}
