import * as $ from "jquery";


// Internally used type for and element selector
// It should be compatible with expected types by jQuery selector tool
export type Selector = JQuery | Element | string;

export const NO_SELECTOR = Symbol("No selector");
export type NoSelector = typeof NO_SELECTOR;

export function isSelector (candidate: any): boolean {
  let type = $.type(candidate);

  if (type === "object") {
    return candidate instanceof jQuery
        || candidate instanceof Element;
  }

  return type === "string";
}


export abstract class AdaptiveElement {
  // Reference to the related jQuery node
  readonly node: JQuery;

  // Reference to the parent element
  readonly parent: AdaptiveElement | null;

  // Possibly relative selector used to identify and find the node
  private readonly selector: Selector | NoSelector;

  // Unique element ID computed when its node is first fetched
  readonly id: string;


  constructor (node: JQuery, selector: Selector | NoSelector = NO_SELECTOR, parent: AdaptiveElement = null) {
    this.node = node;
    this.selector = selector;
    this.parent = parent;

    this.id = this.toID();
  }

  // Abstract method which must be implemented by any adaptive element
  // It must return a string describing the element type (e.g. "item"),
  // and must be unique for each type of element!
  abstract getType (): string;

  // Return a standalone jQuery selector,
  // based on the selectors of this element and all its (grand-)parents
  static nodeToSelector (node: JQuery): string {
    // If the node is null or empty, return an empty selector
    if ((! node) || node.length === 0) {
      return "";
    }

    // If the node reaches the <body> or <html> tag, return the tag itself (as it is unique)
    if (node.is("body") || node.is("html")) {
      return node.prop("tagName");
    }

    // If the node has an id (supposed uniquely identifiable), return its id selector
    let id = node.attr("id");
    if (id && id.length > 0) {
      return `#${id}`;
    }

    // Otherwise, return the node's tag + index selector,
    // and prepend it with its parent selector (using a recursive strategy)
    let tag = node.prop("tagName");
    let index = node.index();

    return AdaptiveElement.nodeToSelector(node.parent()) + ` > ${tag}:eq(${index})`;
  }

  // Returns a standalone jQuery selector of this adaptive element, using nodeToSelector static method
  toSelector (): string {
    return AdaptiveElement.nodeToSelector(this.node);
  }

  // Return an unique ID for the element, based on its selector
  private toID (): string {
    return this.getType() + "/" + this.toSelector();
  }
}
