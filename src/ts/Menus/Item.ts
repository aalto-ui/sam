import * as $ from "jquery";
import { DOMElement } from "./DOMElement";


// Item positions are positive integers
// Position 0 corresponds to the first (top) item
export type ItemPosition = number;


export class Item extends DOMElement {
  // Initial and current position of the item
  readonly initialPosition: ItemPosition;
  position: ItemPosition;

  constructor (node: JQuery, position: ItemPosition) {
    super(node);

    this.initialPosition = position;
    this.position = position;
  }

  // Build an Item object from provided server data
  static fromServerData (data: object) {
    // TODO
  }
}
