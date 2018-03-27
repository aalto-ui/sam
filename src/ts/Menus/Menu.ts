import * as $ from "jquery";
import { AdaptiveElement, Selector } from "./AdaptiveElement";
import { ItemGroup } from "./ItemGroup";
import { Item } from "./Item";


// Menu identifier
// An groupID is formed by the position tags of a menu
export type MenuID = number;


export class Menu extends AdaptiveElement {
  type: string = "menu";

  // Ordered list of menu item groups
  groups: ItemGroup[];

  constructor (node: JQuery, selector: string, groups: ItemGroup[] = []) {
    super(node, selector);

    this.groups = groups;
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

  static fromSelectors (selector: string, descendantSelectors: string[] | object) {
    let node = $(selector);
    let menu = new Menu(node, selector);

    // Case 1: if descendantSelectors is an array, it must contains the item selectors
    // In such a case, the menu has only one item group, formed by its own node
    if (Array.isArray(descendantSelectors)) {
      menu.groups.push(ItemGroup.fromSelectors(null, descendantSelectors, menu));
    }

    // Case 2: otherwise, it must be an object whose keys are group selectors,
    // and whose values are arrays of related item selectors
    else {
      for (let groupSelector in descendantSelectors) {
        let itemSelectors = descendantSelectors[groupSelector];
        menu.groups.push(ItemGroup.fromSelectors(groupSelector, itemSelectors, menu));
      }
    }

    return menu;
  }
}
