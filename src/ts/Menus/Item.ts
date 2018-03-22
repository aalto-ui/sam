import * as $ from "jquery";
import { DOMElement } from "./DOMElement";
import { ItemGroup } from "./ItemGroup";


// Item positions are positive integers
// Position 0 corresponds to the first (top) item
export type ItemPosition = number;


export class Item extends DOMElement {
  // Utility score
  utility: number;

  constructor (node: JQuery, parent: ItemGroup, utility: number = 0) {
    super(node, parent);

    this.utility = utility;
  }
}
