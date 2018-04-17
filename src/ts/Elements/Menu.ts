import * as $ from "jquery";
import { AdaptiveElement, Selector, isSelector, NO_SELECTOR } from "./AdaptiveElement";
import { ItemGroup } from "./ItemGroup";
import { Item } from "./Item";


// Menu identifier
// An groupID is formed by the position tags of a menu
export type MenuID = number;


export class Menu extends AdaptiveElement {
  // Standard AWM class for menus
  static readonly AWM_CLASS = "awm-menu";

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
  // This method should be used when there is no group selector (i.e. menus whose group node is the same as the menu node)
  private fillUsingGenericItemSelector (itemSelector: Selector) {
    this.groups.push(ItemGroup.fromSelectors(NO_SELECTOR, itemSelector, this));
  }

  // Fill a menu using the given generic group and item selectors
  // If the groupSelector applies to this menu node, the fillUsingGenericItemSelector is used instead
  // Note: if there is no distinct group, consider using the aforementioned method instead
  private fillUsingGenericGroupAndItemSelectors (groupSelector: Selector, itemSelector: Selector) {
    let self = this;

    // Either the menu node is its own single group node,
    // or group nodes are searched in the DOM subtree rooted in this menu node
    let groupNodes = this.node.is(groupSelector)
                   ? this.node
                   : this.node.find(groupSelector);

    groupNodes.each(function (_, element) {
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
  static fromSelectors (menuSelector: Selector, itemSelector: Selector): Menu;
  static fromSelectors (menuSelector: Selector, groupSelector: Selector, itemSelector: Selector): Menu;
  static fromSelectors (menuSelector: Selector, descendantSelectors: {[key: string]: Selector}): Menu;

  static fromSelectors (menuSelector: Selector, selector2: Selector | {[key: string]: Selector}, selector3?: Selector): Menu {
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
