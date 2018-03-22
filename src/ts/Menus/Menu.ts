import * as $ from "jquery";
import { AdaptiveElement } from "./AdaptiveElement";
import { ItemGroup } from "./ItemGroup";


export class Menu extends AdaptiveElement {
  // Ordered list of menu item groups
  groups: ItemGroup[];

  constructor (node: JQuery, groups: ItemGroup[]) {
    super(node);

    this.groups = groups;
  }
}
