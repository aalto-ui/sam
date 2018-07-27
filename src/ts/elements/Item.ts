import * as $ from "jquery";
import { AdaptiveElement, Selector } from "./AdaptiveElement";
import { ItemGroup } from "./ItemGroup";
import { Utilities, PageID } from "../Utilities";
import { Reorder } from "../adaptations/techniques/Reorder";


export type ItemID = string;


export class Item extends AdaptiveElement {

  /*************************************************************** PROPERTIES */

  /**
   * Standard HTML class for item elements.
   */
  static readonly AWM_CLASS: string = "awm-item";

  /**
   * Type of item elements.
   */
  static readonly ELEMENT_TYPE: string = "item";

  /**
   * Group element owning the item.
   */
  readonly parent: ItemGroup;

  /**
   * Flag indicating whether the item can be reordered or not.
   */
  canBeReordered: boolean;


  /************************************************************** CONSTRUCTOR */

  /**
   * Create a new instance of item.
   *
   * If the given node has the [[Reorder.NON_REORDERABLE_ELEMENT_CLASS]] class,
   * the item will be marked as non-reorderable.
   *
   * @param node     The node of the element.
   * @param selector The selector used to find the element node.
   * @param parent   The parent group.
   */
  constructor (node: JQuery, selector: Selector, parent: ItemGroup) {
    super(node, selector, parent);

    this.canBeReordered = true;
    if (node.hasClass(Reorder.NON_REORDERABLE_ELEMENT_CLASS)) {
      this.canBeReordered = false;
    }
  }


  /****************************************************************** METHODS */

  getType (): string {
    return Item.ELEMENT_TYPE;
  }

  /**
   * Search for link ("<a>") nodes among the item node itself and its descendants,
   * optionally filtered by the given page ID.
   *
   * @param  pageID The page ID links must match with.
   * @return        The 0+ matching link nodes.
   */
  findLinkNodes (pageID?: PageID): JQuery {
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


  /*********************************************************** STATIC METHODS */

  /**
   * Split the given list of items into sub-lists of items of the same group.
   * The order of the initial list is respected in each sub-list.
   *
   * @param  items The items to split by group.
   * @return       A list of lists of split items.
   */
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
