import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";
import { PageVisitsAnalysis } from "../../Data/PageVisitsAnalyser";
import { Policy, ItemWithScore } from "./Policy";


export abstract class LinkedPageScorePolicy extends Policy {

  abstract readonly name: string;

  private pageScores: Map<string, number>;
  private itemScores: Map<Item, number>;

  // Internal reference to a page visit analysis
  // This property can be used by any policy method, and is refreshed every time a new sorting occurs
  protected pageVisitsAnalysis: PageVisitsAnalysis;


  constructor () {
    super();

    this.pageScores = new Map();
    this.itemScores = new Map();

    this.pageVisitsAnalysis = null;
  }


  protected abstract computePageScore (pageID: string): number;


  private computeAndSetPageScores () {
    this.pageScores.clear();

    let pageStats = this.pageVisitsAnalysis.pageStats;
    for (let pageID in pageStats) {
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

          console.info("Match between item and page ID")
          console.log(item)
          console.log(pageID)

          break;
        }
      }

      this.itemScores.set(item, score);
    }
  }

  getSortedItemsWithScores (menus: Menu[], analyser: DataAnalyser): ItemWithScore[] {
    let items = Menu.getAllMenusItems(menus);

    this.pageVisitsAnalysis = analyser.getPageVisitsAnalysis();
    this.computeAndSetPageScores();
    this.computeAndSetItemScores(items);

    console.log("Scores of linked items:")
    console.log([...this.itemScores.entries()]
      .map(([item, score]) => {
        return {
          item: item,
          score: score
        }
      })
      .sort((itemWithScore1, itemWithScore2) => {
        return itemWithScore2.score - itemWithScore1.score;
      }))

    return [...this.itemScores.entries()]
      .map(([item, score]) => {
        return {
          item: item,
          score: score
        }
      })
      .sort((itemWithScore1, itemWithScore2) => {
        return itemWithScore2.score - itemWithScore1.score;
      });
  }
}
