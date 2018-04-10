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

  static fromSelectors (selector: string | null, itemSelectors: string | string[], parent: Menu) {
    // If no selector is provided, assume the node is the same as its parent's node
    let node  = selector ? parent.node.find(selector) : parent.node;
    let group = new ItemGroup(node, selector, parent);

    // If a generic item selector was given, to match all item nodes
    // In that case, positional/id selectors are made out of all matching item nodes
    if (typeof itemSelectors === "string") {
      let itemCandidateNodes = node.find(itemSelectors);

      let positionalSelectors = [];
      itemCandidateNodes.each((index, element) => {
        let id = element.id;

        if (id && id.length > 0) {
          positionalSelectors.push(itemSelectors + `#${id}`);
        }
        else {
          positionalSelectors.push(itemSelectors + `:eq(${index})`);
        }
      });

      itemSelectors = positionalSelectors;
    }

    // Otherwise (if an array of selectors was given),
    // or once the positional selectors have been created, the group can be created
    for (let itemSelector of itemSelectors) {
      group.items.push(Item.fromSelector(itemSelector, group));
    }

    return group;
  }
}
