import { MenuManager } from "../../elements/MenuManager";
import { DataManager } from "../../data/DataManager";
import { Item } from "../../elements/Item";
import { ItemClicksAnalysis, ItemClicksAnalyser } from "../../data/ItemClicksAnalyser";
import { Policy, ItemWithScore } from "./Policy";


export class AccessRankPolicy extends Policy {

  readonly name: string = "AccessRank";

  constructor () {
    super();
  }


  private computeMarkovScores (items: Item[], itemClicksAnalysis: ItemClicksAnalysis): Map<Item, number> {
    let markovScores = new Map();

    for (let item of items) {
      let itemID = item.id;

      let score = (itemClicksAnalysis.itemStats.get(itemID).localNbClicks + 1)
                / (itemClicksAnalysis.totalLocalNbClicks + 1);
      markovScores.set(item, score);
    }

    // console.log("Markov scores: ", markovScores);

    return markovScores;
  }

  private computeCRFScores (items: Item[], itemClicksAnalysis: ItemClicksAnalysis): Map<Item, number> {
    let currentIndex = itemClicksAnalysis.currentEventIndex;
    let crfScores = new Map();

    for (let item of items) {
      let itemID = item.id;

      // Constants used for CRF computation (same as in the AccessRank paper)
      const p = 2;
      const lambda = 0.1;

      let score = 0;
      for (let eventIndex of itemClicksAnalysis.itemStats.get(itemID).eventIndices) {
        score += Math.pow(1 / p, lambda * (currentIndex - eventIndex));
      }

      crfScores.set(item, score);
    }

    // console.log("CRF scores: ", crfScores);

    return crfScores;
  }

  private computeRegularityScores (items: Item[], itemClicksAnalysis: ItemClicksAnalysis): Map<Item, number> {
    // First, count how many clicks occur each hour/day
    // Arrays are resp. indexed by hours (0-23) and days (0-6)
    let nbHourlyClicksPerItem = new Map<Item, number[]>();
    let nbDailyClicksPerItem = new Map<Item, number[]>();

    for (let item of items) {
      let itemID = item.id;
      let timestamps = itemClicksAnalysis.itemStats.get(itemID).timestamps;

      // Otherwise, approximate/count how many have occurend during
      // (1) the same hour and (2) the same day
      let nbHourlyClicks = new Array(24).fill(0);
      let nbDailyClicks = new Array(7).fill(0);

      for (let timestamp of timestamps) {
        let hour = new Date(timestamp).getHours();
        nbHourlyClicks[hour] += 1;

        let day = new Date(timestamp).getDay();
        nbDailyClicks[day - 1] += 1;
      }

      nbHourlyClicksPerItem.set(item, nbHourlyClicks);
      nbDailyClicksPerItem.set(item, nbDailyClicks);
    }

    // Then, compute a score based on both counts for each item
    let regularityScores = new Map();

    for (let item of items) {
      let itemID = item.id;

      // If there has been less than 10 clicks, set h and d to 1 (cf. AccessRank paper)
      let h = 1;
      let d = 1;

      // Otherwise, compute hour- and day- regularity ratios (compared to current time)
      if (itemClicksAnalysis.itemStats.get(itemID).nbClicks > 10) {
        // Hour-related score part
        let currentHour = new Date().getHours();
        let previousHour = currentHour === 0 ? 23 : currentHour - 1;
        let nextHour = currentHour === 23 ? 23 : 0;

        let nbHourlyClicks = nbHourlyClicksPerItem.get(item);
        let sameHourSlotNbClicks = nbHourlyClicks[previousHour]
                                 + nbHourlyClicks[currentHour]
                                 + nbHourlyClicks[nextHour];

        let averageSameHourSlotNbClicks = 0;
        for (let i = 0; i < 24; i ++) {
          averageSameHourSlotNbClicks += nbHourlyClicks[i === 0 ? 23 : i - 1]
                                       + nbHourlyClicks[i]
                                       + nbHourlyClicks[i === 23 ? 0 : i + 1];
        }
        averageSameHourSlotNbClicks /= 24;

        // Day-related score part
        let currentDay = new Date().getDay();
        let nbDailyClicks = nbDailyClicksPerItem.get(item);
        let sameDayNbClicks = nbDailyClicks[currentDay - 1];

        let averageSameDayNbClicks = 0;
        for (let nbClicks of nbDailyClicks) {
          averageSameDayNbClicks += nbClicks;
        }
        averageSameDayNbClicks /= 7;

        // Update d and h accordingly
        h = sameHourSlotNbClicks / averageSameHourSlotNbClicks;
        d = sameDayNbClicks / averageSameDayNbClicks;
      }

      // Final item score
      let score = Math.pow(Math.max(0.8, Math.min(1.25, h * d)), 0.25);

      // console.log("Regularity score: ", score, "h = ", h, "d = ", d);

      regularityScores.set(item, score);
    }

    return regularityScores;
  }

  getSortedItemsWithScores (menuManager: MenuManager, dataManager?: DataManager): ItemWithScore[] {
    let itemClicksAnalysis = dataManager.analyser.getItemClickAnalysis();

    // Get all items, and split them in two lists,
    // according to whether there are stats (= recorded clicks) on them or not
    let items = menuManager.getAllItems();

    let splitItems = ItemClicksAnalyser.splitItemsByStatsAvailability(items, itemClicksAnalysis);
    let itemsWithStats = splitItems.withStats;
    let itemsWithoutStats = splitItems.withoutStats;

    // Compute intermediate scores for items with stats
    let markovScores = this.computeMarkovScores(itemsWithStats, itemClicksAnalysis);
    let crfScores = this.computeCRFScores(itemsWithStats, itemClicksAnalysis);
    let regularityScores = this.computeRegularityScores(itemsWithStats, itemClicksAnalysis);

    // Compute AccessRank scores from intermediate ones
    const alpha = 1;

    let accessRankScores = new Map();
    // let scoreSum = 0;

    for (let item of itemsWithStats) {
      let markovScore = markovScores.get(item);
      let crfScore = crfScores.get(item);
      let regularityScore = regularityScores.get(item);

      let score = Math.pow(markovScore, alpha)
                * Math.pow(crfScore, 1 / alpha)
                * regularityScore;

      accessRankScores.set(item, score);
      // scoreSum += score;
    }

    // Sort items (with stats) with scores by their AccessRank scores
    let sortedItemsWithScores = [...accessRankScores.entries()]
      .sort((tuple1, tuple2) => {
        return tuple2[1] - tuple1[1];
      })
      .map((tuple) => {
        return {
          item: tuple[0],
          score: tuple[1] // / scoreSum
        };
      });

    /*
    console.log("AccessRank scores:")
    console.table(sortedItemsWithScores.map((o) => {
      let obj = {};
      obj["Item label"] = o.item.node.text();
      obj["AccessRank score"] = Number(o.score.toPrecision(3));
      return obj;
    }));
    */

    // Give a score of zero to items without stats
    let itemsWithoutStatsWithScores = itemsWithoutStats.map((item) => {
      return {
        item: item,
        score: 0
      };
    });

    // Return sorted item (with stats) with scores, followed by those without stats
    return sortedItemsWithScores.concat(itemsWithoutStatsWithScores);
  }
}
