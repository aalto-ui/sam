import * as $ from "jquery";
import { DOMElement } from "./DOMElement";
import { Item } from "./Item";


// Item group positions are positive integers
// Position 0 corresponds to the first (top) group
export type GroupPosition = number;


export class ItemGroup extends DOMElement {
  // Ordered list of menu items
  items: Item[];

  // Initial and current position of the group
  readonly initialPosition: GroupPosition;
  position: GroupPosition;

  constructor (node: JQuery, items: Item[], position: GroupPosition) {
    super(node);

    this.items = items;

    this.initialPosition = position;
    this.position = position;
  }

  // Build a ItemGroup object from provided server data
  static fromServerData (data: object) {
    // TODO
  }
}
