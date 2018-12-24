import { MenuManager } from "../../elements/MenuManager";
import { Item } from "../../elements/Item";
import { PageVisitsAnalysis } from "../../data/PageVisitsAnalyser";
import { TargetPolicy, ItemWithScore } from "./TargetPolicy";
import { DataManager } from "../../data/DataManager";
import { PageID } from "../../Utilities";


export abstract class LinkedPageScorePolicy extends TargetPolicy {

  // ============================================================ PROPERTIES ===

  abstract readonly name: string;

  private readonly pageScores: Map<PageID, number>;
  private readonly itemScores: Map<Item, number>;

  // Internal reference to a page visit analysis
  // This property can be used by any policy method, and is refreshed every time a new sorting occurs
  protected pageVisitsAnalysis: PageVisitsAnalysis;


  // =========================================================== CONSTRUCTOR ===

  constructor () {
    super();

    this.pageScores = new Map();
    this.itemScores = new Map();

    this.pageVisitsAnalysis = null;
  }


  // =============================================================== METHODS ===

  protected abstract computePageScore (pageID: PageID): number;


  private computeAndSetPageScores () {
    this.pageScores.clear();

    for (let pageID of this.pageVisitsAnalysis.pageStats.keys()) {
      let score = this.computePageScore(pageID);
      this.pageScores.set(pageID, score);
    }
  }

  private computeAndSetItemScores (items: Item[]) {
    this.itemScores.clear();

    for (let item of items) {
      // By default, each item has a score of zero
      let score = 0;

      // If the item contains at least one link to a page with a score,
      // its new score becomes the score of the linked page
      for (let pageID of this.pageScores.keys()) {
        let matchingLinkNodes = item.findLinkNodes(pageID);

        if (matchingLinkNodes.length > 0) {
          score = this.pageScores.get(pageID);
          break;
        }
      }

      this.itemScores.set(item, score);
    }
  }

  getSortedItemsWithScores (menuManager: MenuManager, dataManager?: DataManager): ItemWithScore[] {
    let items = menuManager.getAllItems();

    this.pageVisitsAnalysis = dataManager.analyser.getPageVisitsAnalysis();
    this.computeAndSetPageScores();
    this.computeAndSetItemScores(items);

    return [...this.itemScores.entries()]
      .map(([item, score]) => {
        return {
          item: item,
          score: score
        };
      })
      .sort((itemWithScore1, itemWithScore2) => {
        return itemWithScore2.score - itemWithScore1.score;
      });
  }
}
