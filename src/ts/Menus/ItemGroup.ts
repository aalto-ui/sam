import * as $ from "jquery";
import { AdaptiveElement, Selector } from "./AdaptiveElement";
import { Item } from "./Item";
import { Menu } from "./Menu";


export class ItemGroup extends AdaptiveElement {
  type: string = "group";

  // Ordered list of menu items
  items: Item[];

  constructor (node: JQuery, selector: string, parent: Menu, items: Item[] = []) {
    super(node, selector, parent);

    this.items = items;
  }

  static fromSelectors (selector: string | null, itemSelectors: string[], parent: Menu) {
    // If no selector is provided, assume the node is the same as its parent's node
    let node  = selector ? parent.node.find(selector) : parent.node;
    let group = new ItemGroup(node, selector, parent);

    for (let itemSelector of itemSelectors) {
      group.items.push(Item.fromSelector(itemSelector, group));
    }

    return group;
  }
}
