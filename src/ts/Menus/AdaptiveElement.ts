import * as $ from "jquery";


// Internally used type for and element selector
// It should be compatible with expected types by jQuery selector tool
export type Selector = JQuery | string;


export class AdaptiveElement {
  // Descriptive type of the adaptive element
  // This property should be set by any class extending this one
  type: string = "generic";

  // Reference to the related jQuery node
  node: JQuery;

  // Reference to the parent element
  parent: AdaptiveElement | null;


  constructor (node: JQuery, parent: AdaptiveElement = null, selector: Selector = null) {
    this.node = node;
    this.parent = parent;
  }

  // Build a AdaptiveElement object from a given jQuery selector
  // Note: if a valid parent is provided, the selector is only applied to this element and its descendants to fetch the node
  static fromSelector (selector: Selector, parent: AdaptiveElement = null) {
    let node = parent ? parent.node.find(selector) : $(selector);
    return new AdaptiveElement(node, parent, selector)
  }

  // Tag the related element
  // It takes the form of an attribute data-<attr> = <value>
  tag (name: string, value: string) {
    this.node.attr("data-awm-" + name, value);
  }

  tagWithPosition () {
    console.log(this.type);
    this.tag(this.type, this.node.index().toString());
  }
}
