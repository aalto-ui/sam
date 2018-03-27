import * as $ from "jquery";
import { Adaptation } from "../Adaptation";
import { AdaptiveElement } from "../../Menus/AdaptiveElement";
import { Item } from "../../Menus/Item";


export abstract class Highlight extends Adaptation {
  protected static readonly HIGHLIGHTED_ELEMENT_CLASS: string = "awm-highlighted";


  private static onNode (node: JQuery) {
    node.addClass(this.HIGHLIGHTED_ELEMENT_CLASS);
  }

  private static offNode (node: JQuery) {
    node.removeClass(this.HIGHLIGHTED_ELEMENT_CLASS);
  }

  
  protected static onElement (element: AdaptiveElement) {
    this.onNode(element.node);
  }

  protected static offElement (element: AdaptiveElement) {
    this.offNode(element.node);
  }


  protected static reset () {
    $(this.HIGHLIGHTED_ELEMENT_CLASS).removeClass(this.HIGHLIGHTED_ELEMENT_CLASS);
  }
}
