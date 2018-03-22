import * as $ from "jquery";
import { DOMElement } from "./DOMElement";
import { ItemGroup } from "./ItemGroup";


// Item positions are positive integers
// Position 0 corresponds to the first (top) item
export type ItemPosition = number;


export class Item extends DOMElement {
  // Initial and current position of the item
  readonly initialPosition: ItemPosition;
  position: ItemPosition;

  // Utility score
  utility: number;

  constructor (node: JQuery, parent: ItemGroup,
               position?: ItemPosition, highlighted: boolean = false, utility: number = 0) {
    super(node, parent);

    this.initialPosition = position;
    this.position = position;

    this.utility = utility;
  }
}
