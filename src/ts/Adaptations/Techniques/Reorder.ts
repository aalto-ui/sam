import * as $ from "jquery";
import { AdaptationTechnique, AdaptationPolicy } from "../Adaptation";
import { AdaptiveElement } from "../../Elements/AdaptiveElement";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { ItemGroup } from "../../Elements/ItemGroup";
import { Item } from "../../Elements/Item";


export abstract class Reorder implements AdaptationTechnique {
  // Map from HTML parent elements to JQuery children in their original order
  // This is internally used to reset the reordering
  private childrenInOriginalOrder: Map<HTMLElement, JQuery>;

  constructor () {
    this.childrenInOriginalOrder = new Map();
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
  private static insertNode (node: JQuery, index: number) {
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

  private moveNode (node: JQuery, index: number) {
    Reorder.insertNode(node, index);
    node.addClass(this.getReorderedElementClass());
  }

  private getSortedChildrenIndices (parent: JQuery): number[] {
    let type = this.getReorderedElementType();
    return parent.children(`[${AdaptiveElement.TAG_PREFIX}type=${type}]`)
      .get()
      .map((element) => {
        return $(element).index();
      })
      .sort();
  }

  // Return a map from each unique parent element to its children nodes
  // The order of the children respects the order of the nodes in the given array
  private splitNodesByParents (nodes: JQuery[]): Map<HTMLElement, JQuery[]> {
    let parentsToChildren = new Map<HTMLElement, JQuery[]>();

    for (let node of nodes) {
      let parentElement = node.parent().get(0);

      if (parentsToChildren.has(parentElement)) {
        let siblings = parentsToChildren.get(parentElement);
        siblings.push(node);
      }
      else {
        parentsToChildren.set(parentElement, [node]);
      }
    }

    return parentsToChildren;
  }

  protected reorderAllElements (elements: AdaptiveElement[]) {
    let nodes = elements.map((element) => {
      return element.node;
    });

    let nodesSplitByParents = this.splitNodesByParents(nodes);

    for (let parent of nodesSplitByParents.keys()) {
      let nodesWithSameParent = nodesSplitByParents.get(parent);
      let insertionIndices = this.getSortedChildrenIndices($(parent));

      nodesWithSameParent.forEach((node, index) => {
        this.moveNode(node, insertionIndices[index]);
      });
    }
  }

  reset () {
    for (let [parent, orderedChildNodes] of this.childrenInOriginalOrder) {
      let parentNode = $(parent);
      orderedChildNodes.each((_, element) => {
        parentNode.append(element);
      });
    }

    this.childrenInOriginalOrder.clear();

    let reorderedElementClass = this.getReorderedElementClass();
    $("." + reorderedElementClass).removeClass(reorderedElementClass);
  }

  abstract apply (menus: Menu[], policy: AdaptationPolicy, analyser?: DataAnalyser);
}
