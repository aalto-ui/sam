import * as $ from "jquery";
import { AdaptiveElement } from "./AdaptiveElement";
import { ItemGroup } from "./ItemGroup";


// Item positions are positive integers
// Position 0 corresponds to the first (top) item
export type ItemPosition = number;

// Item identifier
// An item ID is formed by the position tags of a menu, a group and an item
export interface ItemID {
  menuPos: number;
  groupPos: number;
  itemPos: number;
};


export class Item extends AdaptiveElement {
  type: string = "item";

  // Utility score
  utility: number;

  constructor (node: JQuery, parent: ItemGroup, utility: number = 0) {
    super(node, parent);
    this.tagWithPosition();

    this.utility = utility;
  }

  static findNodeWithPositionTags (menuPos: number, groupPos: number, itemPos: number) {
    let menu = ItemGroup.findWithPositionTags(menuPos, groupPos);
    if (menu.attr("data-awm-group") === groupPos.toString()) {
      return menu;
    }

    return menu.find(`[data-awm-group=${groupPos}]`);
  }

  static findNodeWithID (id: ItemID) {
    return Item.findNodeWithPositionTags(id.menuPos, id.groupPos, id.itemPos);
  }
}
