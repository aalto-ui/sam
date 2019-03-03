/** @module menu-abstraction */

import * as $ from "jquery";
import { AdaptiveElement, Selector, isSelector, NO_SELECTOR } from "./AdaptiveElement";
import { ItemGroup } from "./ItemGroup";
import { Item } from "./Item";


/**
 * Type of the unique identifier of a menu.
 * See [[AdaptiveElement.getID]] method for details.
 */
export type MenuID = string;


export class Menu extends AdaptiveElement {

  // ============================================================ PROPERTIES ===

  /** Standard HTML class for menu elements. */
  static readonly AWM_CLASS: string = "awm-menu";

  /** Type of menu element. */
  static readonly ELEMENT_TYPE: string = "menu";

  /** `null` since a menu always has no parent. */
  readonly parent: null;

  /** List of all the menu groups. */
  readonly groups: ItemGroup[];


  // =========================================================== CONSTRUCTOR ===

  /**
   * Creates a new instance of menu.
   *
   * @param node     The node of the element.
   * @param selector The selector used to find the element node.
   * @param groups   A list of the menu groups.
   */
  constructor (node: JQuery, selector: Selector, groups: ItemGroup[] = []) {
    super(node, selector);

    this.groups = groups;
  }


  // =============================================================== METHODS ===

  getType (): string {
    return Menu.ELEMENT_TYPE;
  }

  /**
   * Return a list of all the menu items.
   *
   * @return A list of all items.
   */
  getAllItems (): Item[] {
    let items = [];
    for (let group of this.groups) {
      items = items.concat(group.items);
    }

    return items;
  }

  /**
   * Return a list of all the menu item nodes.
   *
   * @return A list of all item nodes.
   */
  getAllItemNodes (): JQuery[] {
    return this
      .getAllItems()
      .map((item) => {
        return item.node;
      });
  }


  // ===========================================================================
  // Menu building
  // ===========================================================================

  // Fill a menu using the given generic item selector
  // This method should be used when there is no group selector (i.e. menus whose group node is the same as the menu node)
  private fillUsingGenericItemSelector (itemSelector: Selector) {
    this.groups.push(ItemGroup.fromSelectors(NO_SELECTOR, itemSelector, this));
  }

  // Fill a menu using the given generic group and item selectors
  // If the groupSelector applies to this menu node, the fillUsingGenericItemSelector is used instead
  // Note: if there is no distinct group, consider using the aforementioned method instead
  private fillUsingGenericGroupAndItemSelectors (groupSelector: Selector, itemSelector: Selector) {
    // Either the menu node is its own single group node,
    // or group nodes are searched in the DOM subtree rooted in this menu node
    let groupNodes = this.node.is(groupSelector)
                   ? this.node
                   : this.node.find(groupSelector);

    groupNodes.each((_, element) => {
      this.groups.push(ItemGroup.fromSelectors(element, itemSelector, this));
    });
  }

  // Fill a menu using the given specific group selectors
  // Each key must represent a specific group selector (i.e. one group only),
  // and each value must be a selector for items in the group (necessarily deeper in the DOM)
  private fillUsingSpecificGroupSelectors (descendantSelectors: {[groupSelector: string]: Selector}) {
    for (let groupSelector in descendantSelectors) {
      if (descendantSelectors.hasOwnProperty(groupSelector)) {
        let itemSelectors = descendantSelectors[groupSelector];
        this.groups.push(ItemGroup.fromSelectors(groupSelector, itemSelectors, this));
      }
    }
  }


  // ======================================================== STATIC METHODS ===

  static getAllMenusItems (menus: Menu[]): Item[] {
    let allMenusItems = [];
    for (let menu of menus) {
      allMenusItems = allMenusItems.concat(menu.getAllItems());
    }

    return allMenusItems;
  }

  static getAllMenusGroups (menus: Menu[]): ItemGroup[] {
    let allMenusGroups = [];
    for (let menu of menus) {
      allMenusGroups = allMenusGroups.concat(menu.groups);
    }

    return allMenusGroups;
  }


  // Build a menu from selectors, with various combinations available depending on the arguments
  // Refer to the specific methods for more details!
  static fromSelectors (menuSelector: Selector, itemSelector: Selector): Menu;
  static fromSelectors (menuSelector: Selector, groupSelector: Selector, itemSelector: Selector): Menu;
  static fromSelectors (menuSelector: Selector, descendantSelectors: {[groupSelector: string]: Selector}): Menu;

  static fromSelectors (menuSelector: Selector, selector2: Selector | {[groupSelector: string]: Selector}, selector3?: Selector): Menu {
    let node = $(menuSelector);
    let menu = new Menu(node, menuSelector);

    // Case 1: called with two arguments
    // selector2 must either be a generic item selector, or an objet of group-item selectors
    if (selector3 === undefined) {
      if (isSelector(selector2)) {
        // console.log("fillUsingGenericItemSelector");
        menu.fillUsingGenericItemSelector(selector2 as Selector);
      }
      else {
        // console.log("fillUsingSpecificGroupSelectors");
        menu.fillUsingSpecificGroupSelectors(selector2 as {[groupSelector: string]: Selector});
      }
    }

    // Case 2: called with three arguments
    // selector2 and selector3 two arguments must resp. be generic group and item selectors
    else {
      // console.log("fillUsingGenericGroupAndItemSelectors");
      menu.fillUsingGenericGroupAndItemSelectors(selector2 as Selector, selector3);
    }

    return menu;
  }

}
