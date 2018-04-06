import * as $ from "jquery";
import { AdaptiveElement, Selector } from "./AdaptiveElement";
import { ItemGroup } from "./ItemGroup";


export class Item extends AdaptiveElement {
  type: string = "item";

  constructor (node: JQuery, selector: string, parent: ItemGroup) {
    super(node, selector, parent);
  }

  // Look for link (<a>) nodes among the link element itself and is children,
  // possibly fileterd by the given pathname
  // (which must then match with the end of the href attribute of the link)
  findLinkNodes (pathnameFilter?: string): JQuery {
    let linkNodes = this.node.find("a");
    if (this.node.is("a")) {
      linkNodes = linkNodes.add(this.node);
    }

    // if a pathname filter is specified, only keep links whose href attribute
    // match the end of the current page pathname
    if (pathnameFilter) {
      linkNodes = linkNodes.filter((_, element) => {
        let href = $(element).attr("href");
        return href.length > 0
            && pathnameFilter.endsWith(href);
      });
    }

    return linkNodes;
  }

  static fromSelector (selector: string, parent: ItemGroup) {
    let node = parent.node.find(selector);
    return new Item(node, selector, parent);
  }
}
