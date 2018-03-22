import * as $ from "jquery";


// Internally used type for and element selector
// It should be compatible with expected types by jQuery selector tool
type Selector = JQuery | string;


export class AdaptiveElement {
  // Selector to reach the element
  selector: Selector | null;

  // Reference to the related jQuery node
  node: JQuery;

  // Reference to the parent element
  parent: AdaptiveElement | null;

  constructor (node: JQuery, parent: AdaptiveElement = null, selector: Selector = null) {
    this.node     = node;
    this.selector = selector;
    this.parent = parent;
  }

  // Build a AdaptiveElement object from a given jQuery selector
  static fromSelector (selector: Selector, parent: AdaptiveElement = null) {
    let node = $(selector);
    return new AdaptiveElement(node, parent, selector)
  }
}
