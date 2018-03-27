import * as $ from "jquery";
import { AdaptiveElement, Selector } from "./AdaptiveElement";
import { ItemGroup } from "./ItemGroup";


export class Item extends AdaptiveElement {
  type: string = "item";

  constructor (node: JQuery, selector: string, parent: ItemGroup) {
    super(node, selector, parent);
  }

  static fromSelector (selector: string, parent: ItemGroup) {
    let node = parent.node.find(selector);
    return new Item(node, selector, parent);
  }

  static findAllNodes () {
    return $("[data-awm-item]");
  }
}
