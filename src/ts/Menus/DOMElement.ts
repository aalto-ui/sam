import * as $ from "jquery";


// Internally used type for and element selector
// It should be compatible with expected types by jQuery selector tool
type Selector = JQuery | string;


export class DOMElement {
  // Selector to reach the element
  selector: Selector | null;

  // Reference to the related jQuery node
  node: JQuery;

  constructor (node: JQuery, selector: Selector = null) {
    this.node     = node;
    this.selector = selector;
  }

  // Build a DOMElement object from a given jQuery selector
  static fromSelector (selector: Selector) {
    let node = $(selector);
    return new DOMElement(node, selector)
  }
}
