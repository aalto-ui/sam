import * as $ from "jquery";
import { AdaptiveElement, Selector, NO_SELECTOR, NoSelector } from "./AdaptiveElement";
import { Item } from "./Item";
import { Menu } from "./Menu";


export class ItemGroup extends AdaptiveElement {
  parent: Menu;

  // Ordered list of menu items
  items: Item[];

  constructor (node: JQuery, selector: Selector | NoSelector, parent: Menu, items: Item[] = []) {
    super(node, selector, parent);

    this.items = items;
  }

  // Implement required parent method which returns the element type
  getType (): string {
    return "group";
  }

  // Fill a menu using the given item selector
  private fillUsingItemSelector (itemSelector: Selector) {
    let self = this;

    this.node.find(itemSelector).each(function (index, element) {
      self.items.push(Item.fromSelector(element, self));
    });
  }

  // Build a menu from selectors
  // If NO_SELECTOR is passed as the groupSelector argument, it means this groups share its parent menu node
  // (i.e. single group not distinguished from the menu in the DOM)
  static fromSelectors (groupSelector: Selector | NoSelector, itemSelector: Selector, parent: Menu) {
    let node  = groupSelector === NO_SELECTOR ? parent.node : parent.node.find(groupSelector);
    let group = new ItemGroup(node, groupSelector, parent);

    group.fillUsingItemSelector(itemSelector);

    return group;
  }
}
