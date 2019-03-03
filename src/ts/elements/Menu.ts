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

  /**
   * Fill the menu with a single group and items according to
   * the specification of the variant of [[fromSelectors]] with two arguments.
   * 
   * This method is meant for internal use only (see [[fromSelectors]]).
   * 
   * @param itemSelector Selector of the item nodes.
   */
  private fillUsingGenericItemSelector (itemSelector: Selector) {
    this.groups.push(ItemGroup.fromSelectors(NO_SELECTOR, itemSelector, this));
  }

  /**
   * Fill the menu with groups and items according to
   * the specification of the variant of [[fromSelectors]] with three arguments.
   * 
   * This method is meant for internal use only (see [[fromSelectors]]).
   * 
   * @param groupSelector Selector of the group nodes.
   * @param itemSelector  Selector of the item nodes.
   */
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

  /**
   * Fill the menu with groups and items according to
   * the specification of the variant of [[fromSelectors]] with one argument.
   * 
   * This method is meant for internal use only (see [[fromSelectors]]).
   * 
   * @param descendantSelectors Object of item selectors indexed by
   *                            their parent group selectors. 
   */
  private fillUsingSpecificGroupSelectors (descendantSelectors: {[groupSelector: string]: Selector}) {
    for (let groupSelector in descendantSelectors) {
      if (descendantSelectors.hasOwnProperty(groupSelector)) {
        let itemSelectors = descendantSelectors[groupSelector];
        this.groups.push(ItemGroup.fromSelectors(groupSelector, itemSelectors, this));
      }
    }
  }


  // ======================================================== STATIC METHODS ===

  /**
   * Get all the items of the given menus.
   * 
   * @param  menus A list of menus containing the items to return.
   * @return       A list of all the items.
   */
  static getAllMenusItems (menus: Menu[]): Item[] {
    let allMenusItems = [];
    for (let menu of menus) {
      allMenusItems = allMenusItems.concat(menu.getAllItems());
    }

    return allMenusItems;
  }

  /**
   * Get all the groups of the given menus.
   * 
   * @param  menus A list of menus containing the groups to return.
   * @return       A list of all the groups.
   */
  static getAllMenusGroups (menus: Menu[]): ItemGroup[] {
    let allMenusGroups = [];
    for (let menu of menus) {
      allMenusGroups = allMenusGroups.concat(menu.groups);
    }

    return allMenusGroups;
  }

  /**
   * Create a menu from the given menu and item selectors.
   * It will only have one group, whose node will be the same as the menu node.
   * 
   * Item nodes are only searched inside the menu node.
   * 
   * @param  menuSelector Selector of the menu node.
   * @param  itemSelector Selector of the item nodes.
   * @return              A new instance of Menu.
   */
  static fromSelectors (menuSelector: Selector, itemSelector: Selector): Menu;

  /**
   * Create a menu from the given menu, group and item selectors.
   * 
   * The menu node must not be a group node itself
   * (see the variant of [[fromSelectors]] with two arguments instead).
   * 
   * Group nodes are only searched inside the menu node.
   * Item nodes are only searched inside the group node.
   * 
   * @param  menuSelector  Selector of the menu node.
   * @param  groupSelector Selector of the group nodes.
   * @param  itemSelector  Selector of the item nodes.
   * @return               A new instance of Menu.
   */
  static fromSelectors (menuSelector: Selector, groupSelector: Selector, itemSelector: Selector): Menu;

  /**
   * Create a menu manager from the given specific selectors.
   * Each key of `descendantSelectors` must be a group selector,
   * and each related value must be the selector of the group items.
   * 
   * The menu node must not be a group node itself
   * (see the variant of [[fromSelectors]] with two arguments instead).
   * 
   * Group nodes are only searched inside the menu node.
   * Item nodes are only searched inside the group node.
   * 
   * @param  menuSelector        Selector of the menu node.
   * @param  descendantSelectors Object of item selectors indexed by
   *                             their parent group selectors. 
   * @return                     A new instance of Menu.
   */
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
