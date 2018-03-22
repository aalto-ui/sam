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
}
