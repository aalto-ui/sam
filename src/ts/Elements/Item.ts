import * as $ from "jquery";
import { AdaptiveElement, Selector } from "./AdaptiveElement";
import { ItemGroup } from "./ItemGroup";


export class Item extends AdaptiveElement {
  // Standard AWM class for menus
  static readonly AWM_CLASS = "awm-item";

  parent: ItemGroup;

  constructor (node: JQuery, selector: Selector, parent: ItemGroup) {
    super(node, selector, parent);
  }

  // Implement required parent method which returns the element type
  getType (): string {
    return "item";
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
      // Remove any final slash
      pathnameFilter = pathnameFilter.replace(/\/$/, "");

      linkNodes = linkNodes.filter((_, element) => {
        let href = $(element).attr("href");

        // Trim the href attribute, remove potential quotes
        href = href.trim();
        href = href.replace(/"|'/g, "");

        // Remove any final slash
        href = href.replace(/\/$/, "");

        return href.length > 0
            && href.endsWith(pathnameFilter);
      });
    }

    return linkNodes;
  }


  static fromSelector (selector: Selector, parent: ItemGroup): Item {
    let node = parent.node.find(selector);
    return new Item(node, selector, parent);
  }
}
