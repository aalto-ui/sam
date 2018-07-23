import * as $ from "jquery";
import { AdaptiveElement, Selector } from "./AdaptiveElement";
import { ItemGroup } from "./ItemGroup";
import { Utilities } from "../Utilities";


export class Item extends AdaptiveElement {
  // Standard AWM class for menus
  static readonly AWM_CLASS = "awm-item";

  // Type of the element
  static readonly ELEMENT_TYPE = "item";

  parent: ItemGroup;

  // Flag indicating whether the item can be reordered or not
  canBeReordered: boolean;


  constructor (node: JQuery, selector: Selector, parent: ItemGroup) {
    super(node, selector, parent);

    this.canBeReordered = true;
    if (node.hasClass("awm-no-reordering")) {
      this.canBeReordered = false;
    }
  }

  getType (): string {
    return Item.ELEMENT_TYPE;
  }

  // Look for link (<a>) nodes among the link element itself and is children,
  // possibly filtered by a given pageID
  findLinkNodes (pageID?: string): JQuery {
    let linkNodes = this.node.find("a");
    if (this.node.is("a")) {
      linkNodes = linkNodes.add(this.node);
    }

    // If a page ID is given, only keep those whose href values match the latter
    if (pageID !== undefined) {
      linkNodes = linkNodes.filter((_, element) => {
        let href = $(element).attr("href");
        return Utilities.isLinkMatchingPageID(href, pageID);
      });
    }

    return linkNodes;
  }

  // Split a list of items into a list of lists of items belonging to the same group
  // The order of the initial list is respected in the returned sub-lists
  static splitAllByGroup (items: Item[]): Item[][] {
    let itemsSplitByGroup = new Map<ItemGroup, Item[]>();

    for (let item of items) {
      let group = item.parent;

      // If a list already exist of this group, append the item at its end
      if (itemsSplitByGroup.has(group)) {
        itemsSplitByGroup.get(group)
          .push(item);
      }

      // Otherwise, create a new list for this group
      else {
        itemsSplitByGroup.set(group, [item]);
      }
    }

    return [...itemsSplitByGroup.values()];
  }

  static fromSelector (selector: Selector, parent: ItemGroup): Item {
    let node = parent.node.find(selector);
    return new Item(node, selector, parent);
  }
}