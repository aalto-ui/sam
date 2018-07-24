import { AdaptiveElement, Selector, NO_SELECTOR, NoSelector } from "./AdaptiveElement";
import { Item } from "./Item";
import { Menu } from "./Menu";
import { ItemClicksAnalysis } from "../data/ItemClicksAnalyser";


export interface ItemGroupsSplitByStatsAvailability {
  withStats: ItemGroup[];
  withoutStats: ItemGroup[];
}


export class ItemGroup extends AdaptiveElement {
  // Standard AWM class for groups
  static readonly AWM_CLASS = "awm-group";

  // Type of the element
  static readonly ELEMENT_TYPE = "group";

  parent: Menu;

  // Ordered list of menu items
  items: Item[];

  // Flag indicating whether the group can be reordered or not
  canBeReordered: boolean;


  constructor (node: JQuery, selector: Selector | NoSelector, parent: Menu, items: Item[] = []) {
    super(node, selector, parent);

    this.items = items;

    this.canBeReordered = true;
    if (node.hasClass("awm-no-reordering")) {
      this.canBeReordered = false;
    }
  }

  // Return true if all the group items are alphabetically sorted, false otherwise
  isAlphabeticallySorted () {
    let itemLabels = this.items.map((item) => {
      return item.node.text();
    });

    // Compare the current label with the next one, using flexible options for localCompare
    // This allows to accept more diverse variants of (somehow) ordered menus,
    // e.g. including character case and using a natural order for numbers
    let nbLabels = itemLabels.length;

    const localeCompareOptions: any = {
      usage: "sort",
      sensitivity: "base",
      ignorePunctuation: true,
      numeric: true
    };

    return itemLabels.every((label, index) => {
      if (index === nbLabels - 1) {
        return true;
      }

      return label.localeCompare(itemLabels[index + 1], localeCompareOptions) < 0;
    });
  }

  // Update the reordering constraints (canBeReordered) of all the group items, such that:
  // - Any individual item with the awm-no-reordering class will not be reorderable
  // - All other item will be reorderable, EXCEPT if all items are alphabetically ordered
  updateItemsReorderingConstraints () {
    let notAlphabeticallySorted = ! this.isAlphabeticallySorted();

    for (let item of this.items) {
      item.canBeReordered = item.node.hasClass("awm-no-reordering")
                          ? false
                          : notAlphabeticallySorted;
    }
  }


  getType (): string {
    return ItemGroup.ELEMENT_TYPE;
  }

  // Fill a menu using the given item selector
  private fillUsingItemSelector (itemSelector: Selector) {
    let self = this;

    this.node.find(itemSelector).each((_, element) => {
      self.items.push(Item.fromSelector(element, self));
    });

    // The reordering constraint of all (new) items must then be updated
    this.updateItemsReorderingConstraints();
  }

  // Split a list of groups into two lists of groups:
  // the ones with stats about them in the given click analysis, and the ones without
  // The order of the initial list is respected in the returned sub-lists
  static splitAllByStatsAvailability (groups: ItemGroup[], itemClicksAnalysis: ItemClicksAnalysis): ItemGroupsSplitByStatsAvailability {
    let groupsWithStats = [];
    let groupsWithoutStats = [];

    for (let group of groups) {
      let groupID = group.id;

      if (groupID in itemClicksAnalysis.groupStats) {
        groupsWithStats.push(group);
      }
      else {
        groupsWithoutStats.push(group);
      }
    }

    return {
      withStats: groupsWithStats,
      withoutStats: groupsWithoutStats
    };
  }

  // Build a menu from selectors
  // If NO_SELECTOR is passed as the groupSelector argument, it means this groups share its parent menu node
  // (i.e. single group not distinguished from the menu in the DOM)
  static fromSelectors (groupSelector: Selector | NoSelector, itemSelector: Selector, parent: Menu): ItemGroup {
    let node  = groupSelector === NO_SELECTOR ? parent.node : parent.node.find(groupSelector);
    let group = new ItemGroup(node, groupSelector, parent);

    group.fillUsingItemSelector(itemSelector);

    return group;
  }
}
