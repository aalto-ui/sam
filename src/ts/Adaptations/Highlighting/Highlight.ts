import * as $ from "jquery";
import { Adaptation } from "../Adaptation";
import { AdaptiveElement } from "../../Menus/AdaptiveElement";
import { Menu } from "../../Menus/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { DataAnalyser } from "../../UserData/DataAnalyser";


export class Highlight extends Adaptation {
  private static readonly HIGHLIGHTED_ELEMENT_CLASS: string = "awm-highlighted";


  private static onNode (node: JQuery) {
    node.addClass(this.HIGHLIGHTED_ELEMENT_CLASS);
  }

  private static offNode (node: JQuery) {
    node.removeClass(this.HIGHLIGHTED_ELEMENT_CLASS);
  }

  static onElement (element: AdaptiveElement) {
    Highlight.onNode(element.node);
  }

  static offElement (element: AdaptiveElement) {
    Highlight.offNode(element.node);
  }

  static onAllElements (elements: AdaptiveElement[]) {
    elements.forEach(this.onElement);
  }

  static offAllElements (elements: AdaptiveElement[]) {
    elements.forEach(this.offElement);
  }

  static reset () {
    $(Highlight.HIGHLIGHTED_ELEMENT_CLASS).removeClass(Highlight.HIGHLIGHTED_ELEMENT_CLASS);
  }

  static apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    let itemsToHighlight = policy.getItemList(menus, analyser);
    this.onAllElements(itemsToHighlight);
  }
}
