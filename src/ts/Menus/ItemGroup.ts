import * as $ from "jquery";
import { DOMElement } from "./DOMElement";
import { Item } from "./Item";
import { Menu } from "./Menu";


// Item group positions are positive integers
// Position 0 corresponds to the first (top) group
export type GroupPosition = number;


export class ItemGroup extends DOMElement {
  // Ordered list of menu items
  items: Item[];

  // Initial and current position of the group
  readonly initialPosition: GroupPosition;
  position: GroupPosition;

  constructor (node: JQuery, parent: Menu, items: Item[], position: GroupPosition) {
    super(node, parent);

    this.items = items;

    this.initialPosition = position;
    this.position = position;
  }

  // Build a ItemGroup object from provided server data
  static fromServerData (data: object, parent: Menu): ItemGroup {
    let node = typeof data["selector"] === "string"
             ? $(data["selector"])
             : parent.node.children().eq(data["selector"]);

    let position = data["position"];
    let items = [];

    let group = new ItemGroup(node, parent, items, position);

    for (let itemData of data["items"]) {
      let item = Item.fromServerData(itemData, group);
      items.push(item);
    }

    return group;
  }
}
