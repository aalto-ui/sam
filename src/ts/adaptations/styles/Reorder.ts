import * as $ from "jquery";
import { AdaptiveElement } from "../../elements/AdaptiveElement";
import { MenuManager } from "../../elements/MenuManager";
import { DataManager } from "../../data/DataManager";
import { TargetPolicy } from "../policies/TargetPolicy";
import { AdaptationStyle } from "./AdaptationStyle";


export abstract class Reorder implements AdaptationStyle {

  // ============================================================ PROPERTIES ===

  /**
   * HTML class of container nodes whose children must *not* be reordered.
   */
  static readonly NON_REORDERABLE_ELEMENT_CLASS = "awm-no-reordering";

  abstract readonly name: string;

  /**
   * Map from HTML parent elements to JQuery children nodes, in their original order.
   * This is used to save the original element ordering.
   */
  protected readonly childrenInOriginalOrder: Map<HTMLElement, JQuery>;

  /**
   * Map from HTML elements to their original indices.
   * This is used to move non-reorderable elements back to their original position.
   */
  private readonly nonReorderableElementsInitialIndices: Map<HTMLElement, number>;


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of Reorder.
   */
  constructor () {
    this.childrenInOriginalOrder = new Map();
    this.nonReorderableElementsInitialIndices = new Map();
  }


  // =============================================================== METHODS ===


  // ===========================================================================
  // Utility
  // ===========================================================================

  /**
   * Return the HTML class to add to elements which have been reordered.
   *
   * This method should be overriden by any child class willing to distinguish
   * the elements it can reorder by their class.
   *
   * @return The class to add to reordered elements.
   */
  protected getReorderedElementClass (): string {
    return "awm-reordered";
  }

  /**
   * Return the type of adaptive elements (as returned by [[AdaptiveElement.getType]])
   * which are being reordered.
   *
   * @return The type of adaptive elements which are being reordered.
   */
  protected abstract getReorderedElementType (): string;

  /**
   * Compute and return a map from each unique parent element (of all given nodes)
   * to an array of all their children.
   *
   * The original order of the children is conserved in the arrays.
   *
   * @param  nodes The nodes to split by their parents.
   * @return       A map from parent elements to arrays of child nodes.
   */
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


  // ===========================================================================
  // Node reordering
  // ===========================================================================

  /**
   * Reinsert the given node at the given index (in its own parent).
   *
   * @param  node  The node to reinsert.
   * @param  index The new index of the node.
   */
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

  /**
   * Move the given node at the given index (in its own parent),
   * and add a class to the node to mark it as reordered.
   *
   * @param  node  The node to move.
   * @param  index The new index of the node.
   */
  private moveReorderableNode (node: JQuery, index: number) {
    this.insertNode(node, index);
    node.addClass(this.getReorderedElementClass());
  }

  /**
   * Move all non-reorderable elements back to their original indices.
   */
  private reinsertNonReorderableElements () {
    for (let element of this.nonReorderableElementsInitialIndices.keys()) {
      let originalIndex = this.nonReorderableElementsInitialIndices.get(element);
      this.insertNode($(element), originalIndex);
    }
  }


  // ===========================================================================
  // Apply technique
  // ===========================================================================

  /**
   * Save the original indices of all child nodes of the given parent node
   * which have the [[Reorder.NON_REORDERABLE_ELEMENT_CLASS]] class.
   *
   * @param  parent The parent node with possibly non-reorderable children.
   */
  private saveNonReorderableElementsOriginalIndices (parent: JQuery) {
    parent.children("." + Reorder.NON_REORDERABLE_ELEMENT_CLASS)
      .each((_, element) => {
        let index = $(element).index();
        this.nonReorderableElementsInitialIndices.set(element, index);
      });
  }

  /**
   * Save the original order of all children of all the nodes of the given adaptive elements.
   *
   * The order is saved by saving an array of references
   * to all the children(as jQuery nodes) in their original orders.
   *
   * @param  elements The adaptive elements whose children order must be saved.
   */
  protected saveParentNodeChildrenInOriginalOrder (elements: AdaptiveElement[]) {
    for (let element of elements) {
      let parentElement = element.node.parent()[0];

      if (! this.childrenInOriginalOrder.has(parentElement)) {
        this.childrenInOriginalOrder.set(parentElement, $(parentElement).children());
      }
    }
  }

  /**
   * Sort and return the indices of all the child nodes of the given parent node
   * which can be reordered, i.e. which have a matching adaptive element type
   * (according to [[Reorder.getReorderedElementType]]).
   *
   * @param  parent The parent node containing reorderable child nodes
   *                whose indices must be sorted.
   * @return        A sorted list of child node indices.
   */
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

  /**
   * Reorder all given elements in the given order.
   *
   * Non-given elements may be moved to a higher index if need be,
   * except for elements marked as non-reorderable.
   *
   * This method expects a complete list of menu adaptive elements, supposedly computed by a policy.
   * It was designed to be called by implementations of [[Technique.apply]].
   *
   * @param  elements The sorted list of elements to reorder.
   */
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

  abstract apply (menuManager: MenuManager, policy: TargetPolicy, dataManager?: DataManager);


  // ===========================================================================
  // Reset technique
  // ===========================================================================

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
}
