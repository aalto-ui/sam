import * as $ from "jquery";
import { AdaptiveElement, Selector } from "./AdaptiveElement";
import { ItemGroup } from "./ItemGroup";
import { Item } from "./Item";


export class Menu extends AdaptiveElement {
  // Ordered list of menu item groups
  groups: ItemGroup[];

  constructor (node: JQuery, groups: ItemGroup[]) {
    super(node);

    this.groups = groups;
  }

  static fromSelectors (menuSelector: Selector, groupSelector: Selector, itemSelector: Selector): Menu {
    let menuNode = $(menuSelector);

    let groups = [];
    let menu = new Menu(menuNode, groups);

    menuNode.find(groupSelector).addBack().each(function (_, element) {
      let groupNode = $(element);

      let items = [];
      let group = new ItemGroup(groupNode, menu, items);
      groups.push(group);

      groupNode.find(itemSelector).each(function (_, element) {
        let itemNode = $(element);

        let item = new Item(itemNode, group);
        items.push(item);
      })
    });

    return menu;
  }
}
