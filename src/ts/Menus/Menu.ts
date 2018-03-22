import * as $ from "jquery";
import { DOMElement } from "./DOMElement";
import { ItemGroup } from "./ItemGroup";


export class Menu extends DOMElement {
  // Ordered list of menu item groups
  groups: ItemGroup[];

  constructor (node: JQuery, groups: ItemGroup[]) {
    super(node);

    this.groups = groups;
  }

  // Build a Menu object from provided server data
  static fromServerData (data: object): Menu {
    let node = $(data["selector"]);
    let groups = [];

    let menu = new Menu(node, groups);

    for (let groupData of data["groups"]) {
      let group = ItemGroup.fromServerData(groupData, menu);
      groups.push(group);
    }

    return menu;
  }
}
