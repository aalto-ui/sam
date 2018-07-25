import { Menu, MenuID } from "./Menu";
import { Item } from "./Item";
import { ItemGroup } from "./ItemGroup";
import { Selector, isSelector } from "./AdaptiveElement";


// Type alias used for convenience
// It represents an object who keys are menu selectors, and values are either
// generic item selectors, or specific group-items selector objects
export interface MenuSelectors {
  [menuSelector: string]: Selector | {[groupSelector: string]: Selector};
}


export class MenuManager {

  /*************************************************************** PROPERTIES */

  // List of adaptive menus
  private readonly menus: Menu[];


  /************************************************************** CONSTRUCTOR */

  constructor (menus: Menu[] = []) {
    this.menus = menus;
  }


  /****************************************************************** METHODS */

  addMenu (menu: Menu) {
    this.menus.push(menu);
  }

  removeMenu (id: MenuID): Menu | null {
    let removalIndex = this.menus.findIndex((menu) => {
      return menu.id === id;
    });

    if (removalIndex === -1) {
      return null;
    }

    return this.menus.splice(removalIndex, 1)[0];
  }


  getAllItems (): Item[] {
    return Menu.getAllMenusItems(this.menus);
  }

  getNbItems (): number {
    return this.getAllItems().length;
  }

  getAllGroups (): ItemGroup[] {
    return Menu.getAllMenusGroups(this.menus);
  }

  getNbGroups (): number {
    return this.getAllGroups().length;
  }

  getAllMenus (): Menu[] {
    return this.menus;
  }

  getNbMenus (): number {
    return this.getAllMenus().length;
  }


  /*********************************************************** STATIC METHODS */

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
