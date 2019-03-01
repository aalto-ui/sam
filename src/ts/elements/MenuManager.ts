/** @module menu-abstraction */

import { Menu, MenuID } from "./Menu";
import { Item } from "./Item";
import { ItemGroup } from "./ItemGroup";
import { Selector, isSelector } from "./AdaptiveElement";


/**
 * Interface of a complex selector.
 * 
 * It can used to select or more menus, groups and items
 * when creating a new instance of menu manager.
 * 
 * Each `menuSelector` key must be a string selector which targets a single menu.
 * Each associated value can either be:
 * - a selector for all the items of the menu;
 * - an object whose each `groupSelector` key is a string selector for a group,
 *   and whose associated value is a selector for the items it contains.
 */
export interface MenuSelectors {
  [menuSelector: string]: Selector | {[groupSelector: string]: Selector};
}


export class MenuManager {

  // ============================================================ PROPERTIES ===

  /**
   * List of all adaptive menus.
   */
  private readonly menus: Menu[];


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of menu manager.
   *
   * @param menus A list of adaptive menus to use.
   */
  constructor (menus: Menu[] = []) {
    this.menus = menus;
  }


  // =============================================================== METHODS ===

  // ===========================================================================
  // Menu/group/item-related getters
  // ===========================================================================

  /**
   * Get all the items of all adaptive menus.
   *
   * @return A list of all the items.
   */
  getAllItems (): Item[] {
    return Menu.getAllMenusItems(this.menus);
  }

  /**
   * Get the number of items of all adaptive menus.
   *
   * @return The total number of items.
   */
  getNbItems (): number {
    return this.getAllItems().length;
  }

  /**
   * Get all the groups of all adaptive menus.
   *
   * @return A list of all the groups.
   */
  getAllGroups (): ItemGroup[] {
    return Menu.getAllMenusGroups(this.menus);
  }

  /**
   * Get the number of groups of all adaptive menus.
   *
   * @return The total number of groups.
   */
  getNbGroups (): number {
    return this.getAllGroups().length;
  }

  /**
   * Get all the adaptive menus.
   *
   * @return A list of all the menus.
   */
  getAllMenus (): Menu[] {
    return this.menus;
  }

  /**
   * Get the number of adaptive menus.
   *
   * @return The total number of menus.
   */
  getNbMenus (): number {
    return this.getAllMenus().length;
  }


  // ===========================================================================
  // Menu addition and removal
  // ===========================================================================

  /**
   * Add a new adaptive menu.
   *
   * @param  menu The menu to add.
   */
  addMenu (menu: Menu) {
    this.menus.push(menu);
  }

  /**
   * Remove an adaptive menu.
   * If there is no match with the given ID, return `null`.
   *
   * @param  id The ID of the menu to remove.
   * @return    The removed menu, or `null` if it could not be found.
   */
  removeMenu (id: MenuID): Menu | null {
    let removalIndex = this.menus.findIndex((menu) => {
      return menu.id === id;
    });

    if (removalIndex === -1) {
      return null;
    }

    return this.menus.splice(removalIndex, 1)[0];
  }


  // ======================================================== STATIC METHODS ===

  // Create a menu manager from the given generic menu and item selectors
  // This builder method assumes that each menu is its own single group
  // (see Menu and ItemGroup for details)
  static fromGenericMenuAndItemSelectors (menuSelector: Selector, itemSelector: Selector): MenuManager {
    let menus = [];
    $(menuSelector).each((_, element) => {
      menus.push(Menu.fromSelectors(element, itemSelector));
    });

    return new MenuManager(menus);
  }

  // Create a menu manager from the given generic menu, group and item selectors
  // This builder method must NOT be used for menus whose group node is
  // the same as the menu node: in such case, use fromGenericMenuAndItemSelectors instead!
  static fromGenericMenuGroupAndItemSelectors (menuSelector: Selector, groupSelector: Selector, itemSelector: Selector): MenuManager {
    let menus = [];
    $(menuSelector).each((_, element) => {
      menus.push(Menu.fromSelectors(element, groupSelector, itemSelector));
    });

    return new MenuManager(menus);
  }

  // Create a menu manager from the given specific menu selectors (as keys),
  // and either specific or generic items/groups and items selectors (as values)
  // (see MenuSelectors type definition for details)
  static fromSpecificSelectors (selectors: MenuSelectors): MenuManager {
    let menus = [];
    for (let menuSelector in selectors) {
      if (selectors.hasOwnProperty(menuSelector)) {
        let descendantSelector = selectors[menuSelector];

        // Case 1: the descendant selector is a generic item selector
        if (isSelector(descendantSelector)) {
          menus.push(Menu.fromSelectors(menuSelector, descendantSelector as Selector));
        }

        // Case 2: the descendant selector is a specific group-item selector object
        else {
          descendantSelector = descendantSelector as {[groupSelector: string]: Selector};
          menus.push(Menu.fromSelectors(menuSelector, descendantSelector));
        }
      }
    }

    return new MenuManager(menus);
  }
}
