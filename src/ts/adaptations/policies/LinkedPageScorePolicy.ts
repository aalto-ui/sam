/** @module adaptation */

import { MenuManager } from "../../elements/MenuManager";
import { Item } from "../../elements/Item";
import { PageVisitsAnalysis } from "../../data/PageVisitsAnalyser";
import { TargetPolicy, ItemWithScore } from "./TargetPolicy";
import { DataManager } from "../../data/DataManager";
import { PageID } from "../../Utilities";


export abstract class LinkedPageScorePolicy extends TargetPolicy {

  // ============================================================ PROPERTIES ===

  abstract readonly name: string;

  /**
   * Map from webpage IDs to their scores.
   * 
   * It is used internally to share scores easily accross methods,
   * and is cleared and recomputed everytime new scores must be computed.
   */
  private readonly pageScores: Map<PageID, number>;

  /**
   * Map from items to their scores.
   * 
   * It is used internally to share scores easily accross methods,
   * and is cleared and recomputed everytime new scores must be computed.
   */
  private readonly itemScores: Map<Item, number>;

  /**
   * Page visits analysis used to compute scores.
   * 
   * It is used internally to share it easily accross methods,
   * and is cleared and recomputed everytime new scores must be computed.
   */
  protected pageVisitsAnalysis: PageVisitsAnalysis;


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of LinkedPageScorePolicy.
   */
  constructor () {
    super();

    this.pageScores = new Map();
    this.itemScores = new Map();

    this.pageVisitsAnalysis = null;
  }


  // =============================================================== METHODS ===

  /**
   * Compute the score of the webpage with the given ID,
   * possibly using data from [[pageVisitsAnalysis]].
   * 
   * @param  pageID The ID of the page to rank.
   * @return        The score of the page with the given ID.
   */
  protected abstract computePageScore (pageID: PageID): number;


  /**
   * Compute the score of each webpage listed in the page visits analysis,
   * and fill the [[pageScores]] map accordingly.
   */
  private computeAndSetPageScores () {
    this.pageScores.clear();

    for (let pageID of this.pageVisitsAnalysis.pageStats.keys()) {
      let score = this.computePageScore(pageID);
      this.pageScores.set(pageID, score);
    }
  }

  /**
   * Compute the score of each given item,
   * and fill the [[itemScores]] map accordingly.
   * 
   * @param items The list of items to rank.
   */
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
