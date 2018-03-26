import * as $ from "jquery";
import { Highlight } from "./Highlight";
import { DataAnalyser } from "../../UserData/DataAnalyser";
import { Item, ItemID } from "../../Menus/Item";


export class HighlightMostClickedItems extends Highlight {
  // Maximum number of items to hghlight
  private static MAX_NB_HIGHLIGHTED_ITEMS: number = 2;

  // If true, only highlight items which have already been clicked at least once
  private static ONLY_HIGHLIGHT_CLICKED_ITEMS: boolean = true;

  // If true, the 'most' clicked items stats concern the whole website,
  // and not the current page only; this means some page may have no highlighted
  // items even though some have already been clicked

  // TODO: use this parameter
  // private static USE_SITE_WISE_STATS: boolean = false;

  // TODO: clean and split code
  // Stats and node analysis should be moved elsewhere

  static apply (analyser: DataAnalyser) {
    console.log("Begin highlighting");

    let itemClickAnalysis = analyser.analyseItemClicks();

    // TODO: helper functions to move elsewhere
    function itemIDToString (id: ItemID) {
      return id.menuPos.toString() + "-" + id.groupPos.toString() + "-" + id.itemPos.toString();
    }

    function itemIDFromString (stringID: string) {
      let splitStringID = stringID.split("-");
      return {
        menuPos: parseInt(splitStringID[0]),
        groupPos: parseInt(splitStringID[1]),
        itemPos: parseInt(splitStringID[2])
      };
    }

    // Map each item of the current page to their logged nb of click
    let clickPerItem = new Map();
    let itemNodes = Item.findAllNodes();
    console.log("All nodes", itemNodes);

    for (let node of itemNodes) {
      let id = Item.getNodeItemID($(node));
      try {
        let nbClicks = itemClickAnalysis.menus[id.menuPos].groups[id.groupPos].items[id.itemPos].nbClicks;
        clickPerItem.set(itemIDToString(id), nbClicks);
      }
      catch {
        clickPerItem.set(itemIDToString(id), 0);
      }
    }

    // DEBUG: add scores and IDs to item inner HTML
    for (let tuple of [...clickPerItem.entries()]) {
      let stringID = tuple[0];
      let nbClicks = tuple[1];

      let id = itemIDFromString(tuple[0]);
      let node = Item.findNodeWithID(id);

      console.log("Append info to", node, id);
      node.html(node.html() + ` id: ${stringID} /  nbClicks: ${nbClicks}`);
    }

    // Turn the map into a list sorted by the nb of clicks
    let itemsSortedByNbClicks = [...clickPerItem.entries()].sort((e1, e2) => {
      return e2[1] - e1[1];
    });

    // If required, filter that list to only highlight already clicked items
    if (! this.ONLY_HIGHLIGHT_CLICKED_ITEMS) {
      itemsSortedByNbClicks = itemsSortedByNbClicks.filter(e => {
        e[1] > 0;
      });
    }

    // Only highlight the most clicked items, whose IDs are at the top that list
    Highlight.reset();

    let nbHighlightedItems = 0;
    for (let stringIDNbClicksCouple of itemsSortedByNbClicks) {
      let id = itemIDFromString(stringIDNbClicksCouple[0]);
      Highlight.onItemWithID(id);

      nbHighlightedItems++;
      if (nbHighlightedItems === this.MAX_NB_HIGHLIGHTED_ITEMS) {
        break;
      }

      console.log("Highlighting done");
    }
  }
}
