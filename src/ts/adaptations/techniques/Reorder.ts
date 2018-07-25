import * as $ from "jquery";
import { AdaptiveElement } from "../../elements/AdaptiveElement";
import { MenuManager } from "../../elements/MenuManager";
import { DataManager } from "../../data/DataManager";
import { Policy } from "../policies/Policy";
import { Technique } from "./Technique";


export abstract class Reorder implements Technique<Policy> {

  static readonly NON_REORDERABLE_ELEMENT_CLASS = ".awm-no-reordering";

  abstract readonly name: string;

  // Map from HTML parent elements to JQuery children in their original order
  // This is internally used to reset the reordering
  protected childrenInOriginalOrder: Map<HTMLElement, JQuery>;

  // Map from HTML elements which should not be reordered to their original indices
  // This is internally used to always reinsert them at their original position
  private nonReorderableElementsInitialIndices: Map<HTMLElement, number>;


  constructor () {
    this.childrenInOriginalOrder = new Map();
    this.nonReorderableElementsInitialIndices = new Map();
  }

  // This method should be overriden by child classes which
  // wish to distinguish their reordering from other types of reordering!
  // It must return a string representing the class to be added to reordered elements
  protected getReorderedElementClass (): string {
    return "awm-reordered";
  }

  // This method must be overriden by any concrete child class
  // It must return a string representing the type of adaptive elements being reordered
  protected abstract getReorderedElementType (): string;

  // Insert a node at a given index, with no side effect
  private insertNode (node: JQuery, index: number) {
    if (index === node.index()) {
      return;
    }

    if (index === 0) {
      node
        .parent()
        .prepend(node);
    }

    else {
      node
        .parent()
        .children()
        .eq(index - 1)
        .after(node);
    }
  }

  private moveReorderableNode (node: JQuery, index: number) {
    this.insertNode(node, index);
    node.addClass(this.getReorderedElementClass());
  }

  private reinsertNonReorderableElements () {
    for (let element of this.nonReorderableElementsInitialIndices.keys()) {
      let originalIndex = this.nonReorderableElementsInitialIndices.get(element);
      this.insertNode($(element), originalIndex);
    }
  }

  private getSortedChildrenIndices (parent: JQuery): number[] {
    let type = this.getReorderedElementType();

    return parent
      .children(`[${AdaptiveElement.TAG_PREFIX}type=${type}]`)
      .get()
      .map((element) => {
        return $(element).index();
      })
      .sort((index1, index2) => {
        return index1 - index2;
      });
  }

  // Return a map from each unique parent element to its children nodes
  // The order of the children respects the order of the nodes in the given array
  private splitNodesByParents (nodes: JQuery[]): Map<HTMLElement, JQuery[]> {
    let parentsToChildren = new Map<HTMLElement, JQuery[]>();

    for (let node of nodes) {
      let parentElement = node
        .parent()
        .get(0);

      if (parentsToChildren.has(parentElement)) {
        parentsToChildren
          .get(parentElement)
          .push(node);
      }
      else {
        parentsToChildren.set(parentElement, [node]);
      }
    }

    return parentsToChildren;
  }

  private saveNonReorderableElementsOriginalIndices (parent: JQuery) {
    parent.children(Reorder.NON_REORDERABLE_ELEMENT_CLASS)
      .each((_, element) => {
        let index = $(element).index();
        this.nonReorderableElementsInitialIndices.set(element, index);
      });
  }

  protected saveParentNodeChildrenInOriginalOrder (elements: AdaptiveElement[]) {
    for (let element of elements) {
      let parentElement = element.node.parent()[0];

      if (! this.childrenInOriginalOrder.has(parentElement)) {
        this.childrenInOriginalOrder.set(parentElement, $(parentElement).children());
      }
    }
  }

  protected reorderAllElements (elements: AdaptiveElement[]) {
    // Split element nodes by parents
    let nodes = elements.map((element) => {
      return element.node;
    });

    let nodesSplitByParents = this.splitNodesByParents(nodes);

    // Reorder elements grouped by common parent nodes
    for (let parent of nodesSplitByParents.keys()) {
      let parentNode = $(parent);
      let childNodes = nodesSplitByParents.get(parent);

      // Save the initial indices of non-reorderable elements
      this.saveNonReorderableElementsOriginalIndices(parentNode);

      // Move nodes at indices of element nodes' of the same kind (e.g. item or group)
      let insertionIndices = this.getSortedChildrenIndices(parentNode);
      childNodes.forEach((node, index) => {
        this.moveReorderableNode(node, insertionIndices[index]);
      });
    }

    // Finally reinsert elements which should not be reordered at their initial indices
    this.reinsertNonReorderableElements();
  }

  reset () {
    // Reinsert all children of parents of reordered elements at their original indices
    for (let [parent, orderedChildNodes] of this.childrenInOriginalOrder.entries()) {
      let parentNode = $(parent);

      orderedChildNodes.each((_, element) => {
        parentNode.append(element);
      });
    }

    this.childrenInOriginalOrder.clear();

    // Remove all reordered element classes
    let reorderedElementClass = this.getReorderedElementClass();
    $("." + reorderedElementClass).removeClass(reorderedElementClass);

    // Reset internal fields
    this.nonReorderableElementsInitialIndices.clear();
  }

  abstract apply (menuManager: MenuManager, policy: Policy, dataManager?: DataManager);
}
