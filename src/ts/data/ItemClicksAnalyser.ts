import { Database, TableEntryIndex, TableEntry } from "./Database";
import { Utilities } from "../Utilities";
import { DataAnalyserModule } from "./DataAnalyserModule";
import { Analysis } from "./DataAnalyser";
import { ItemClickLog } from "./DataLogger";
import { Item } from "../elements/Item";
import { ItemGroup } from "../elements/ItemGroup";

// Generic interface for element stats, and specific ones for actual elements
export interface AdaptiveElementStats {
  nbClicks: number;
  localNbClicks: number;
  clickFrequency: number;
  localClickFrequency: number;

  sourcePageIDs: string[];
  timestamps: number[];

  eventIndices: TableEntryIndex[];
}

export interface ItemStats extends AdaptiveElementStats { }
export interface ItemGroupStats extends AdaptiveElementStats { }


// Interface implemented by the item clicks analysis returned by this module
export interface ItemClicksAnalysis extends Analysis {
  totalNbClicks: number;
  totalLocalNbClicks: number;
  itemStats: {[key: string]: ItemStats};
  groupStats: {[key: string]: ItemGroupStats};
  currentEventIndex: TableEntryIndex;
}


export interface ItemsSplitByStatsAvailability {
  withStats: Item[];
  withoutStats: Item[];
}

export interface ItemGroupsSplitByStatsAvailability {
  withStats: ItemGroup[];
  withoutStats: ItemGroup[];
}


export class ItemClicksAnalyser extends DataAnalyserModule {
  constructor (database: Database) {
    super(database);
  }

  private createItemClickAnalysis (): ItemClicksAnalysis {
    return {
      totalNbClicks: 0,
      totalLocalNbClicks: 0,
      itemStats: {},
      groupStats: {},
      currentEventIndex: this.database.getItemClickLogsCurrentIndex()
    };
  }

  private createItemStats (): ItemStats {
    return {
      nbClicks: 0,
      localNbClicks: 0,
      clickFrequency: 0,
      localClickFrequency: 0,

      eventIndices: [],
      sourcePageIDs: [],
      timestamps: []
    };
  }

  private createItemGroupStats (): ItemGroupStats {
    return {
      nbClicks: 0,
      localNbClicks: 0,
      clickFrequency: 0,
      localClickFrequency: 0,

      eventIndices: [],
      sourcePageIDs: [],
      timestamps: []
    };
  }

  private updateItemStats (log: TableEntry<ItemClickLog>, analysis: ItemClicksAnalysis, clickHappenedOnThisPage: boolean) {
    let itemID = log.itemID;

    // Create an item stats object if required
    if (! (itemID in analysis.itemStats)) {
      analysis.itemStats[itemID] = this.createItemStats();
    }

    // Update the item stats
    let itemStats = analysis.itemStats[itemID];

    itemStats.nbClicks += 1;
    if (clickHappenedOnThisPage) {
      itemStats.localNbClicks += 1;
    }

    itemStats.sourcePageIDs.push(log.pageID);
    itemStats.timestamps.push(log.timestamp);

    itemStats.eventIndices.push(log.index);
  }

  private updateItemGroupStats (log: TableEntry<ItemClickLog>, analysis: ItemClicksAnalysis, clickHappenedOnThisPage: boolean) {
    let groupID = log.groupID;

    // Create an item group stats object if required
    if (! (groupID in analysis.groupStats)) {
      analysis.groupStats[groupID] = this.createItemGroupStats();
    }

    // Update the item group stats
    let groupStats = analysis.groupStats[groupID];

    groupStats.nbClicks += 1;
    if (clickHappenedOnThisPage) {
      groupStats.localNbClicks += 1;
    }

    groupStats.sourcePageIDs.push(log.pageID);
    groupStats.timestamps.push(log.timestamp);

    groupStats.eventIndices.push(log.index);
  }

  private processItemClickLog (log: TableEntry<ItemClickLog>, analysis: ItemClicksAnalysis) {
    let currentPageID = Utilities.getCurrentPageID();
    let clickHappenedOnThisPage = log.pageID === currentPageID;

    // Update global click counters
    analysis.totalNbClicks += 1;
    if (clickHappenedOnThisPage) {
      analysis.totalLocalNbClicks += 1;
    }

    // Update related item and group stats
    this.updateItemStats(log, analysis, clickHappenedOnThisPage);
    this.updateItemGroupStats(log, analysis, clickHappenedOnThisPage);
  }

  private computeFrequencies (analysis: ItemClicksAnalysis) {
    for (let itemID in analysis.itemStats) {
      let itemStats = analysis.itemStats[itemID];

      itemStats.clickFrequency = itemStats.nbClicks / analysis.totalNbClicks;
      itemStats.localClickFrequency = itemStats.localNbClicks / analysis.totalLocalNbClicks;
    }
  }

  protected computeAnalysis (): ItemClicksAnalysis {
    // Get the required data
    let itemClickLogs = this.database.getItemClickLogs();

    // Inititalize the analysis
    let analysis = this.createItemClickAnalysis();

    // Fill the analysis
    for (let itemClickLog of itemClickLogs) {
      this.processItemClickLog(itemClickLog, analysis);
    }

    this.computeFrequencies(analysis);

    return analysis;
  }

  // Split a list of items into two lists of items:
  // - one list with items whose stats are available in the given click analysis
  // - one list with the other items (no stats available)
  // The order of the initial list is respected in each of the sub-lists
  static splitItemsByStatsAvailability (items: Item[], itemClicksAnalysis: ItemClicksAnalysis): ItemsSplitByStatsAvailability {
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

    return {
      withStats: itemsWithStats,
      withoutStats: itemsWithoutStats
    };
  }

  // Split a list of item groups into two lists of groups:
  // - one list with groups whose stats are available in the given click analysis
  // - one list with the other groups (no stats available)
  // The order of the initial list is respected in each of the sub-lists
  static splitItemGroupsByStatsAvailability (groups: ItemGroup[], itemClicksAnalysis: ItemClicksAnalysis): ItemGroupsSplitByStatsAvailability {
    let groupsWithStats = [];
    let groupsWithoutStats = [];

    for (let group of groups) {
      let groupID = group.id;

      if (groupID in itemClicksAnalysis.groupStats) {
        groupsWithStats.push(group);
      }
      else {
        groupsWithoutStats.push(group);
      }
    }

    return {
      withStats: groupsWithStats,
      withoutStats: groupsWithoutStats
    };
  }
}
