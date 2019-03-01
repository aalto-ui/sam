import { AdaptiveElement, Selector, NO_SELECTOR, NoSelector } from "./AdaptiveElement";
import { Item } from "./Item";
import { Menu } from "./Menu";
import { Reorder } from "../adaptations/styles/Reorder";


export type GroupID = string;


export class ItemGroup extends AdaptiveElement {

  // ============================================================ PROPERTIES ===

  /**
   * Standard HTML class for group elements.
   */
  static readonly AWM_CLASS: string = "awm-group";

  /**
   * Type of group elements.
   */
  static readonly ELEMENT_TYPE: string = "group";

  /**
   * Menu element owning the item.
   */
  readonly parent: Menu;

  /**
   * List of all the group items.
   */
  readonly items: Item[];

  /**
   * Flag indicating whether the item can be reordered or not.
   */
  canBeReordered: boolean;


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of group.
   *
   * If the given node has the [[Reorder.NON_REORDERABLE_ELEMENT_CLASS]] class,
   * the group will be marked as non-reorderable.
   *
   * @param node     The node of the element.
   * @param selector The selector used to find the element node.
   * @param parent   The parent menu.
   * @param items    A list of the group items.
   */
  constructor (node: JQuery, selector: Selector | NoSelector, parent: Menu, items: Item[] = []) {
    super(node, selector, parent);

    this.items = items;

    this.canBeReordered = true;
    if (node.hasClass(Reorder.NON_REORDERABLE_ELEMENT_CLASS)) {
      this.canBeReordered = false;
    }
  }


  // =============================================================== METHODS ===

  getType (): string {
    return ItemGroup.ELEMENT_TYPE;
  }

  /**
   * Create item from the given selector, and add them all to the group.
   *
   * Item nodes are only searched inside the group node.
   *
   * @param  itemSelector The selector for all item elements.
   */
  private fillUsingItemSelector (itemSelector: Selector) {
    let self = this;

    this.node
      .find(itemSelector)
      .each((_, element) => {
        self.items.push(Item.fromSelector($(element), self));
      });

    // The reordering constraint of all (new) items must then be updated
    this.updateItemsReorderingConstraints();
  }


  // ===========================================================================
  // Reordering constraint
  // ===========================================================================

  /**
   * Test whether the group items are alphabetically sorted.
   * Character case and punctation are ignored (see _localCompare_ details).
   *
   * @return `true` if they are sorted, `false` otherwise.
   */
  isAlphabeticallySorted (): boolean {
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

  /**
   * Update the reordering constraints of all the group items, such that:
   * - any item which already is non-reorderable remains so;
   * - all other item remain reorderable, _except_ if all items are alphabetically ordered.
   */
  updateItemsReorderingConstraints () {
    let notAlphabeticallySorted = ! this.isAlphabeticallySorted();

    for (let item of this.items) {
      item.canBeReordered = item.canBeReordered
                          ? notAlphabeticallySorted
                          : false;
    }
  }


  // ======================================================== STATIC METHODS ===

  // Build a menu from selectors
  // If NO_SELECTOR is passed as the groupSelector argument, it means this groups share its parent menu node
  // (i.e. single group not distinguished from the menu in the DOM)
  static fromSelectors (groupSelector: Selector | NoSelector, itemSelector: Selector, parent: Menu): ItemGroup {
    let node = groupSelector === NO_SELECTOR
             ? parent.node
             : parent.node.find(groupSelector);

    let group = new ItemGroup(node, groupSelector, parent);
    group.fillUsingItemSelector(itemSelector);

    return group;
  }
}
