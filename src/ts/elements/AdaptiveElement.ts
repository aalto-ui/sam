import * as $ from "jquery";


/**
 * Type of HTML element selectors accepted and used by SAM.
 * 
 * Any accepted type must be compatible with jQuery selector,
 * i.e. $(<selector>) should work as expected.
 */
export type Selector = JQuery | Element | string;

/**
 * Unique value representing the explicit absence of a selector
 * (see [[Selector]]).
 */
export const NO_SELECTOR = Symbol("No selector");

/**
 * Type of an explicit absence of selector (see [[NO_SELECTOR]]).
 */
export type NoSelector = typeof NO_SELECTOR;

/**
 * Test whether the given candidate object is a [[Selector]].
 * 
 * @param  candidate The object to test as a selector.
 * @return           `true` if `candidate` has the right type, `false` otherwise.
 */
export function isSelector (candidate: any): boolean {
  let type = $.type(candidate);

  if (type === "object") {
    return candidate instanceof jQuery
        || candidate instanceof Element;
  }

  return type === "string";
}


export abstract class AdaptiveElement {

  // ============================================================ PROPERTIES ===

  /**
   * Prefix of all AWM tags added to nodes as HTML attributes.
   */
  static readonly TAG_PREFIX: string = "data-awm-";

  /**
   * Node of the element.
   */
  readonly node: JQuery;

  /**
   * Parent adaptive element.
   * If it has no parent, it should be set to `null`.
   */
  readonly parent: AdaptiveElement | null;

  /**
   * Selector used to find the node.
   * If no selector was used, it should be set to [[NO_SELECTOR]].
   */
  readonly selector: Selector | NoSelector;

  /**
   * Unique ID of the element.
   * It should be computed once, before any adaptation, using [[getID]] method.
   */
  readonly id: string;


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of adaptive element.
   * The ID is automatically computed, and the node is tagged with its AWM type.
   *
   * @param node     The node of the element.
   * @param selector The selector used to find the element node.
   * @param parent   The parent adaptive element.
   */
  constructor (node: JQuery, selector: Selector | NoSelector = NO_SELECTOR, parent: AdaptiveElement = null) {
    this.node = node;
    this.selector = selector;
    this.parent = parent;

    this.id = this.getID();

    // Automatically tag the element with its type
    this.tagWithType();
  }


  // =============================================================== METHODS ===

  /**
   * Get the type of the element.
   *
   * Each concrete type of element must return an AWM type
   * which must be unique among all types of elements.
   *
   * @return The element type.
   */
  abstract getType (): string;

  /**
   * Add a _tag_ to the element node, i.e. an prefixed HTML attribute.
   * Note: the prefix is automatically prepended to the tag name.
   *
   * @param  name  The name of the tag (without the prefix).
   * @param  value The value of the attribute.
   */
  tag (name: string, value: string) {
    this.node.attr(AdaptiveElement.TAG_PREFIX + name, value);
  }

  /**
   * Call [[getNodeTag]] on the element node.
   *
   * @param  name The name of the tag (without the prefix).
   * @return      The value of the tag, or `undefined` if the tag was not found.
   */
  getTag (name: string): string | undefined {
    return AdaptiveElement.getNodeTag(this.node, name);
  }

  /**
   * Tag the element node with its element type, using a `type` tag.
   */
  private tagWithType () {
    this.tag("type", this.getType());
  }

  /**
   * Call [[nodeToSelector]] on the element node.
   *
   * @return The element selector.
   */
  getSelector (): string {
    return AdaptiveElement.nodeToSelector(this.node);
  }

  /**
   * Get the ID of the element, which should uniquely identify it.
   *
   * It is formed by the element type followed by the element selector,
   * with a slash ("/") in between.
   *
   * @return The element ID.
   */
  private getID (): string {
    return this.getType() + "/" + this.getSelector();
  }


  // ======================================================== STATIC METHODS ===

  /**
   * Get the value of a tag of the given node.
   * Note: the prefix is automatically prepended to the tag name.
   *
   * @param  node The tagged node (with the attribute).
   * @param  name The name of the tag (without the prefix).
   * @return      The value of the tag, or `undefined` if the tag was not found.
   */
  static getNodeTag (node: JQuery, name: string): string | undefined {
    return node.attr(AdaptiveElement.TAG_PREFIX + name);
  }

  /**
   * Return a standalone jQuery string selector for the given node,
   * i.e. `$(<selector>)` should select the node.
   *
   * The selector is built recursively, in the following way:
   * - if the node is the `body` or `html` node, it returns the related tag selector;
   * - if the node has an ID, it returns the related ID selector;
   * - otherwise, it calls [[nodeToSelector]] on the parent node of the given node,
   *   and returns the result with the following concatenation:
   *   (1) a child selector (`>`);
   *   (2) the node tag;
   *   (3) the node positional selector (`:eq(<index>)`).
   *
   * @param  node The node to represent with a selector.
   * @return      The standalone selector.
   */
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
}
