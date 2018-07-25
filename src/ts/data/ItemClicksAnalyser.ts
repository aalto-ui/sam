import { Database, TableEntryIndex, TableEntry } from "./Database";
import { Utilities, PageID } from "../Utilities";
import { DataAnalyserModule, Analysis } from "./DataAnalyserModule";
import { ItemClickLog } from "./DataLogger";
import { Item, ItemID } from "../elements/Item";
import { ItemGroup, GroupID } from "../elements/ItemGroup";

// Generic interface for element stats, and specific ones for actual elements
export interface AdaptiveElementStats {
  nbClicks: number;
  localNbClicks: number;
  clickFrequency: number;
  localClickFrequency: number;

  sourcePageIDs: PageID[];
  timestamps: number[];

  eventIndices: TableEntryIndex[];
}

export interface ItemStats extends AdaptiveElementStats { }
export interface ItemGroupStats extends AdaptiveElementStats { }


// Interface implemented by the item clicks analysis returned by this module
export interface ItemClicksAnalysis extends Analysis {
  totalNbClicks: number;
  totalLocalNbClicks: number;
  itemStats: Map<ItemID, ItemStats>;
  groupStats: Map<GroupID, ItemGroupStats>;
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


export class ItemClicksAnalyser extends DataAnalyserModule<ItemClicksAnalysis> {

  /*************************************************************** PROPERTIES */

  /************************************************************** CONSTRUCTOR */

  constructor (database: Database) {
    super(database);
  }


  /****************************************************************** METHODS */

  private createItemClickAnalysis (): ItemClicksAnalysis {
    return {
      totalNbClicks: 0,
      totalLocalNbClicks: 0,
      itemStats: new Map(),
      groupStats: new Map(),
      currentEventIndex: this.database.getItemClickLogsCurrentIndex()
    };
  }

  protected makeAnalysisDeepCopy (analysis: ItemClicksAnalysis): ItemClicksAnalysis {
    return {
      totalNbClicks: analysis.totalNbClicks,
      totalLocalNbClicks: analysis.totalLocalNbClicks,
      itemStats: new Map(analysis.itemStats),
      groupStats: new Map(analysis.groupStats),
      currentEventIndex: analysis.currentEventIndex
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

  private updateItemStatsWithClick (log: TableEntry<ItemClickLog>, analysis: ItemClicksAnalysis, clickIsLocal: boolean) {
    let itemID = log.itemID;

    // Create an item stats object if required
    if (! analysis.itemStats.has(itemID)) {
      analysis.itemStats.set(itemID, this.createItemStats());
    }

    // Update the item stats
    let itemStats = analysis.itemStats.get(itemID);

    itemStats.nbClicks += 1;
    if (clickIsLocal) {
      itemStats.localNbClicks += 1;
    }

    itemStats.sourcePageIDs.push(log.pageID);
    itemStats.timestamps.push(log.timestamp);

    itemStats.eventIndices.push(log.index);
  }

  private updateItemGroupStatsWithClick (log: TableEntry<ItemClickLog>, analysis: ItemClicksAnalysis, clickIsLocal: boolean) {
    let groupID = log.groupID;

    // Create an item group stats object if required
    if (! analysis.groupStats.has(groupID)) {
      analysis.groupStats.set(groupID, this.createItemGroupStats());
    }

    // Update the item group stats
    let groupStats = analysis.groupStats.get(groupID);

    groupStats.nbClicks += 1;
    if (clickIsLocal) {
      groupStats.localNbClicks += 1;
    }

    groupStats.sourcePageIDs.push(log.pageID);
    groupStats.timestamps.push(log.timestamp);

    groupStats.eventIndices.push(log.index);
  }

  private processItemClickLog (log: TableEntry<ItemClickLog>, analysis: ItemClicksAnalysis) {
    let currentPageID = Utilities.getCurrentPageID();
    let clickIsLocal = log.pageID === currentPageID;

    // Update global click counters
    analysis.totalNbClicks += 1;
    if (clickIsLocal) {
      analysis.totalLocalNbClicks += 1;
    }

    // Update related item and group stats
    this.updateItemStatsWithClick(log, analysis, clickIsLocal);
    this.updateItemGroupStatsWithClick(log, analysis, clickIsLocal);
  }

  private computeFrequencies (analysis: ItemClicksAnalysis) {
    for (let itemStats of analysis.itemStats.values()) {
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


  /*********************************************************** STATIC METHODS */

  // Split a list of items into two lists of items:
  // - one list with items whose stats are available in the given click analysis
  // - one list with the other items (no stats available)
  // The order of the initial list is respected in each of the sub-lists
  static splitItemsByStatsAvailability (items: Item[], analysis: ItemClicksAnalysis): ItemsSplitByStatsAvailability {
    let itemsWithStats = [];
    let itemsWithoutStats = [];

    for (let item of items) {
      let itemID = item.id;

      if (analysis.itemStats.has(itemID)) {
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
  static splitItemGroupsByStatsAvailability (groups: ItemGroup[], analysis: ItemClicksAnalysis): ItemGroupsSplitByStatsAvailability {
    let groupsWithStats = [];
    let groupsWithoutStats = [];

    for (let group of groups) {
      let groupID = group.id;

      if (analysis.groupStats.has(groupID)) {
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
