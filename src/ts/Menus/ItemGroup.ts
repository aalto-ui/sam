import * as $ from "jquery";
import { AdaptiveElement } from "./AdaptiveElement";
import { Item } from "./Item";
import { Menu } from "./Menu";


// Item group positions are positive integers
// Position 0 corresponds to the first (top) group
export type GroupPosition = number;


export class ItemGroup extends AdaptiveElement {
  // Ordered list of menu items
  items: Item[];

  constructor (node: JQuery, parent: Menu, items: Item[]) {
    super(node, parent);

    this.items = items;
  }
}
