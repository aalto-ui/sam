import * as $ from "jquery";
import { AdaptationTechnique } from "../Adaptation";
import { AdaptiveElement } from "../../Elements/AdaptiveElement";
import { Menu } from "../../Elements/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { DataAnalyser } from "../../Data/DataAnalyser";


export class Highlight implements AdaptationTechnique {
  private static readonly HIGHLIGHTED_ELEMENT_CLASS: string = "awm-highlighted";

  constructor () { }


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
    $("." + Highlight.HIGHLIGHTED_ELEMENT_CLASS).removeClass(Highlight.HIGHLIGHTED_ELEMENT_CLASS);
  }

  reset () {
    Highlight.reset();
  }

  static apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    let itemsToHighlight = policy.getItemList(menus, analyser);
    Highlight.onAllElements(itemsToHighlight);
  }

  apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    Highlight.apply(menus, policy, analyser);
  }
}
