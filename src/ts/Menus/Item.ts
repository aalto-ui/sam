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

  constructor (node: JQuery, parent: ItemGroup) {
    super(node, parent);
    this.tagWithPosition();
  }

  }

  static findNodeWithPositionTags (menuPos: number, groupPos: number, itemPos: number) {
    let group = ItemGroup.findNodeWithPositionTags(menuPos, groupPos);
    return group.find(`[data-awm-item=${itemPos}]`);
  }

  static findNodeWithID (id: ItemID) {
    return Item.findNodeWithPositionTags(id.menuPos, id.groupPos, id.itemPos);
  }

  static findAllNodes () {
    return $("[data-awm-item]");
  }

  static getNodeItemID (itemNode: JQuery) {
    return {
      itemPos: parseInt(itemNode.attr("data-awm-item")),
      groupPos: parseInt(itemNode.closest("[data-awm-group]").attr("data-awm-group")),
      menuPos: parseInt(itemNode.closest("[data-awm-menu]").attr("data-awm-menu"))
    };
  }

  static itemIDToString (id: ItemID) {
    return id.menuPos.toString() + "-" + id.groupPos.toString() + "-" + id.itemPos.toString();
  }

  static itemIDFromString (idString: string) {
    let splitStringID = idString.split("-");
    return {
      menuPos: parseInt(splitStringID[0]),
      groupPos: parseInt(splitStringID[1]),
      itemPos: parseInt(splitStringID[2])
    };
  }
}
