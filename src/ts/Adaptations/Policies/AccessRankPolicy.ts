import * as $ from "jquery";
import { ItemListPolicy } from "./ItemListPolicy";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";
import { ItemClicksAnalysis } from "../../Data/ItemClicksAnalyser";


export class AccessRankPolicy implements ItemListPolicy {
  constructor () { }

  private computeMarkovScores (items: Item[], itemClicksAnalysis: ItemClicksAnalysis): Map<Item, number> {
    let markovScores = new Map();

    for (let item of items) {
      let itemID = item.id;

      let score = itemClicksAnalysis.itemStats[itemID].localNbClicks + 1
                / itemClicksAnalysis.totalLocalNbClicks + 1;
      markovScores.set(item, score);
    }

    console.log("Markov scores: ", markovScores);

    return markovScores;
  }

  private computeCRFScores (items: Item[], itemClicksAnalysis: ItemClicksAnalysis): Map<Item, number> {
    let currentIndex = itemClicksAnalysis.currentEventIndex;
    let CRFScores = new Map();

    for (let item of items) {
      let itemID = item.id;

      // Constants used for CRF computation (same as in the AccessRank paper)
      const p = 2;
      const lambda = 0.1;

      let score = 0;
      for (let eventIndex of itemClicksAnalysis.itemStats[itemID].eventIndices) {
        score += Math.pow(1 / p, lambda * (currentIndex - eventIndex));
      }

      CRFScores.set(item, 1);
    }

    console.log("CRF scores: ", CRFScores);

    return CRFScores;
  }

  private computeRegularityScores (items: Item[], itemClicksAnalysis: ItemClicksAnalysis): Map<Item, number> {
    // First, count how many clicks occur each hour/day
    // Arrays are resp. indexed by hours (0-23) and days (0-6)
    let nbHourlyClicksPerItem = new Map<Item, number[]>();
    let nbDailyClicksPerItem = new Map<Item, number[]>();

    for (let item of items) {
      let itemID = item.id;
      let timestamps = itemClicksAnalysis.itemStats[itemID].timestamps;

      // Otherwise, approximate/count how many have occurend during
      // (1) three consecutive hours intervals and (2) the same day
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
      if (itemClicksAnalysis.itemStats[itemID].nbClicks < 10) {
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

      console.log("Regularity score: ", score, "h = ", h, "d = ", d);

      regularityScores.set(item, score);
    }

    return regularityScores;
  }

  getItemList (menus: Menu[], analyser: DataAnalyser): Item[] {
    let itemClicksAnalysis = analyser.getItemClickAnalysis();
    let currentPagePathname = window.location.pathname;

    // Get all items, and split them in two lists,
    // according to whether there are stats (= recorded clicks) on them or not
    let items = Menu.getAllMenusItems(menus);

    let itemsWithStats = [];
    let itemsWithoutStats = [];

    for (let item of items) {
      let itemID = item.id;

      if (itemID in itemClicksAnalysis.itemStats) {
        itemsWithStats.push(item);
      }
      else {
        itemsWithoutStats.push(item);
      }
    }

    // Compute intermediate scores for items with stats
    let markovScores = this.computeMarkovScores(itemsWithStats, itemClicksAnalysis);
    let CRFScores = this.computeCRFScores(itemsWithStats, itemClicksAnalysis);
    let regularityScores = this.computeRegularityScores(itemsWithStats, itemClicksAnalysis);

    // Compute AccessRank scores from intermediate ones
    const alpha = 1;

    let accessRankScores = new Map();
    for (let item of itemsWithStats) {
      let markovScore = markovScores.get(item);
      let CRFScore = CRFScores.get(item);
      let regularityScore = regularityScores.get(item);

      let score = Math.pow(markovScore, alpha)
                * Math.pow(CRFScore, 1 / alpha)
                * regularityScore;

      accessRankScores.set(item, score);
    }

    // Sort items with stats by their AccessRank scores
    let sortedItems = [...accessRankScores.entries()]
      .sort((tuple1, tuple2) => {
        return tuple2[1] - tuple1[1];
      })
      .map(tuple => {
        return tuple[0];
      });

    // Return sorted items with stats, followed by items without stats
    console.log("sorted items accrank", sortedItems)
    return sortedItems.concat(itemsWithoutStats);
  }
}
