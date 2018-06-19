import * as $ from "jquery";
import { AdaptiveElement, Selector } from "./AdaptiveElement";
import { ItemGroup } from "./ItemGroup";
import { Utilities } from "../Utilities";
import { ItemClicksAnalysis } from "../Data/ItemClicksAnalyser";


export interface ItemsSplitByStatsAvailability {
  withStats: Item[];
  withoutStats: Item[];
}


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
  // possibly fileterd by the given pathname
  // (which must then match with the end of the href attribute of the link)
  findLinkNodes (pathnameFilter?: string): JQuery {
    let linkNodes = this.node.find("a");
    if (this.node.is("a")) {
      linkNodes = linkNodes.add(this.node);
    }

    // if a pathname filter is specified, only keep links whose href attribute
    // match the end of the current page pathname
    if (pathnameFilter) {
      linkNodes = linkNodes.filter((_, element) => {
        let href = $(element).attr("href");
        return Utilities.linkHasPathname(href, pathnameFilter);
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

  // Split a list of items into two lists of items:
  // the ones with stats about them in the given click analysis, and the ones without
  // The order of the initial list is respected in the returned sub-lists
  static splitAllByStatsAvailability (items: Item[], itemClicksAnalysis: ItemClicksAnalysis): ItemsSplitByStatsAvailability {
    let itemsWithStats = [];
    let itemsWithoutStats = [];

    for (let item of items) {
      let itemID = item.id;

      if (itemID in itemClicksAnalysis.itemStats) {
        itemsWithStats.push(item);
      }
      else {
        itemsWithoutStats.push(item);
      }
    }

    return {
      withStats: itemsWithStats,
      withoutStats: itemsWithoutStats
    };
  }

  static fromSelector (selector: Selector, parent: ItemGroup): Item {
    let node = parent.node.find(selector);
    return new Item(node, selector, parent);
  }
}
