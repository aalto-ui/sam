import * as $ from "jquery";


// Internally used type for and element selector
// It should be compatible with expected types by jQuery selector tool
export type Selector = JQuery | HTMLElement | string;


export class AdaptiveElement {
  // Descriptive type of the adaptive element
  // This property should be set by any class extending this one
  type: string = "generic";

  // Reference to the related jQuery node
  node: JQuery;

  // Reference to the parent element
  parent: AdaptiveElement | null;

  // Possibly relative selector used to identify and find the node
  selector: string;


  constructor (node: JQuery, selector: string = null, parent: AdaptiveElement = null) {
    this.node = node;
    this.parent = parent;
    this.selector = selector;
  }

  // Tag the related element
  // It takes the form of an attribute data-<attr> = <value>
  tag (name: string, value: string) {
    this.node.attr("data-awm-" + name, value);
  }

  // Return a standalone jQuery selector,
  // based on the selectors of this element and all its (grand-)parents
  // This methods assumes an adaptive element can be uniquely identified by its selector!
  toSelector (): string {
    let parentSelector = "";
    if (this.parent && this.parent.node !== this.node) {
      parentSelector = this.parent.toSelector();
    }

    return parentSelector + " " + this.selector;
  }

  // Return an unique ID for the element, based on its selector
  getID (): string {
    return this.type + "/" + this.toSelector();
  }
}
