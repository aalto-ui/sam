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

    // Map each item of the current page to their logged nb of click
    let itemsNbClicks = new Map();

    let itemNodes = Item.findAllNodes();
    for (let node of itemNodes) {
      let id = Item.getNodeItemID($(node));
      let idString = Item.itemIDToString(id);

      try {
        let nbClicks = itemClickAnalysis.menus[id.menuPos].groups[id.groupPos].items[id.itemPos].nbClicks;
        itemsNbClicks.set(idString, nbClicks);
      }
      catch {
        itemsNbClicks.set(idString, 0);
      }
    }

    // DEBUG: add scores and IDs to item inner HTML

    for (let tuple of [...itemsNbClicks.entries()]) {
      let stringID = tuple[0];
      let nbClicks = tuple[1];

      let id = Item.itemIDFromString(tuple[0]);
      let node = Item.findNodeWithID(id);

      console.log("Append info to", node, id);
      node.html(node.html() + ` id: ${stringID} /  nbClicks: ${nbClicks}`);
    }

    // Turn the map into a list sorted by the nb of clicks
    let itemsSortedByNbClicks = [...itemsNbClicks.entries()]
      .map(tuple => {
        return { id: Item.itemIDFromString(tuple[0]), nbClicks: tuple[1] };
      })
      .sort((e1, e2) => {
        return e2.nbClicks - e1.nbClicks;
      });

    // If required, filter that list to only keep already clicked items
    if (! this.ONLY_HIGHLIGHT_CLICKED_ITEMS) {
      itemsSortedByNbClicks = itemsSortedByNbClicks.filter(e => {
        return e.nbClicks > 0;
      });
    }

    // Only highlight the most clicked items, whose IDs are at the top that list
    Highlight.reset();

    let nbHighlightedItems = 0;
    for (let item of itemsSortedByNbClicks) {
      Highlight.onItemWithID(item.id);

      nbHighlightedItems++;
      if (nbHighlightedItems === this.MAX_NB_HIGHLIGHTED_ITEMS) {
        break;
      }

      console.log("Highlighting done");
    }
  }
}
