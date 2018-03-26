import * as $ from "jquery";
import { Adaptation } from "./Adaptation";
import { AdaptiveElement } from "../Menus/AdaptiveElement";
import { ItemID, Item } from "../Menus/Item";


export class Highlight extends Adaptation {
  protected static readonly HIGHLIGHTED_ELEMENT_CLASS = "awm-highlighted";


  private static onNode (node: JQuery) {
    node.addClass(this.HIGHLIGHTED_ELEMENT_CLASS);
  }

  private static offNode (node: JQuery) {
    node.removeClass(this.HIGHLIGHTED_ELEMENT_CLASS);
  }

  /*
  protected static onElement (element: AdaptiveElement) {
    this.onNode(element.node);
  }

  protected static offElement (element: AdaptiveElement) {
    this.offNode(element.node);
  }
  */

  protected static onItemWithID (id: ItemID) {
    let itemNode = Item.findNodeWithID(id);
    this.onNode(itemNode);
  }

  protected static offItemWithID (id: ItemID) {
    let itemNode = Item.findNodeWithID(id);
    this.offNode(itemNode);
  }

  protected static reset () {
    $(this.HIGHLIGHTED_ELEMENT_CLASS).removeClass(this.HIGHLIGHTED_ELEMENT_CLASS);
  }
}
