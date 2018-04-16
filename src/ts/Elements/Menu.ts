import * as $ from "jquery";
import { AdaptiveElement, Selector, isSelector, NO_SELECTOR } from "./AdaptiveElement";
import { ItemGroup } from "./ItemGroup";
import { Item } from "./Item";


// Menu identifier
// An groupID is formed by the position tags of a menu
export type MenuID = number;


export class Menu extends AdaptiveElement {
  parent: null;

  // Ordered list of menu item groups
  groups: ItemGroup[];

  constructor (node: JQuery, selector: Selector, groups: ItemGroup[] = []) {
    super(node, selector);

    this.groups = groups;
  }

  // Implement required parent method which returns the element type
  getType (): string {
    return "menu";
  }

  getAllItems (): Item[] {
    let items = [];
    for (let group of this.groups) {
      items = items.concat(group.items);
    }

    return items;
  }

  getAllItemNodes (): JQuery[] {
    return this.getAllItems().map(item => {
      return item.node;
    });
  }

  static getAllMenusItems (menus: Menu[]): Item[] {
    let allMenusItems = [];
    for (let menu of menus) {
      allMenusItems = allMenusItems.concat(menu.getAllItems());
    }

    return allMenusItems;
  }

  // Fill a menu using the given generic item selector
  // This method is meant to be used when there is no group selector
  // (i.e. menus whose group node is the same as the menu node)
  private fillUsingGenericItemSelector (itemSelector: Selector) {
    this.groups.push(ItemGroup.fromSelectors(NO_SELECTOR, itemSelector, this));
  }

  // Fill a menu using the given generic group and item selectors
  // This method must NOT be used for menus whose group node is the same as the menu node:
  // in such a case, use fromGenericItemSelectors instead!
  private fillUsingGenericGroupAndItemSelectors (groupSelector: Selector, itemSelector: Selector) {
    let self = this;

    $(groupSelector).each(function (_, element) {
      self.groups.push(ItemGroup.fromSelectors(element, itemSelector, self));
    });
  }

  // Fill a menu using the given specific group selectors
  // Each key must represent a specific group selector (i.e. one group only),
  // and each value must be a selector for items in the group (necessarily deeper in the DOM)
  private fillUsingSpecificGroupSelectors (descendantSelectors: {[key: string]: Selector}) {
    for (let groupSelector in descendantSelectors) {
      let itemSelectors = descendantSelectors[groupSelector];
      this.groups.push(ItemGroup.fromSelectors(groupSelector, itemSelectors, this));
    }
  }

  // Build a menu from selectors, with various combinations available depending on the arguments
  // Refer to the specific methods for more details!
  static fromSelectors (menuSelector: Selector, itemSelector: Selector);
  static fromSelectors (menuSelector: Selector, groupSelector: Selector, itemSelector: Selector);
  static fromSelectors (menuSelector: Selector, descendantSelectors: {[key: string]: Selector});

  static fromSelectors (menuSelector: Selector, selector2: Selector | {[key: string]: Selector}, selector3?: Selector) {
    let node = $(menuSelector);
    let menu = new Menu(node, menuSelector);

    // Case 1: called with two arguments
    // selector2 must either be a generic item selector, or an objet of group-item selectors
    if (selector3 === undefined) {
      if (isSelector(selector2)) {
        // console.log("fillUsingGenericItemSelector");
        menu.fillUsingGenericItemSelector(<Selector> selector2);
      }
      else {
        // console.log("fillUsingSpecificGroupSelectors");
        menu.fillUsingSpecificGroupSelectors(<{[key: string]: Selector}> selector2);
      }
    }

    // Case 2: called with three arguments
    // selector2 and selector3 two arguments must resp. be generic group and item selectors
    else {
      // console.log("fillUsingGenericGroupAndItemSelectors");
      menu.fillUsingGenericGroupAndItemSelectors(<Selector> selector2, selector3);
    }

    return menu;
  }

}
