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

  // ============================================================ PROPERTIES ===

  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of item clicks analyser.
   *
   * @param database The database where to fetch data to analyse.
   */
  constructor (database: Database) {
    super(database);
  }


  // =============================================================== METHODS ===


  // ===========================================================================
  // Data structures init/copy
  // ===========================================================================

  /**
   * Create an initialized click analysis object.
   *
   * @return A fresh click analysis object.
   */
  private createItemClickAnalysis (): ItemClicksAnalysis {
    return {
      totalNbClicks: 0,
      totalLocalNbClicks: 0,
      itemStats: new Map(),
      groupStats: new Map(),
      currentEventIndex: this.database.getItemClickLogsCurrentIndex()
    };
  }

  /**
   * Create an initialized item stats object.
   *
   * @return A fresh item stats object.
   */
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

  /**
   * Create an initialized item group stats object.
   *
   * @return A fresh item group stats object.
   */
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

  /**
   * Make a deep copy of the given analysis.
   * Overriden method with a manual field-by-field copy (to handle Map objets).
   *
   * @param  analysis The analysis top copy.
   * @return          A deep copy of the given analysis.
   */
  protected makeAnalysisDeepCopy (analysis: ItemClicksAnalysis): ItemClicksAnalysis {
    return {
      totalNbClicks: analysis.totalNbClicks,
      totalLocalNbClicks: analysis.totalLocalNbClicks,
      itemStats: new Map(analysis.itemStats),
      groupStats: new Map(analysis.groupStats),
      currentEventIndex: analysis.currentEventIndex
    };
  }


  // ===========================================================================
  // Stats computation
  // ===========================================================================

  /**
   * Update an item stats object by processing the given item click log.
   * If the related item stats object does not exist yet, it is created.
   *
   * @param  log          The item click log to process.
   * @param  analysis     The analysis containing the item stats to update.
   * @param  clickIsLocal Whether the given item click log was recorded
   *                      on the current page (`true` if it was).
   */
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

  /**
   * Update an item group stats object by processing the given item click log.
   * If the related item group stats object does not exist yet, it is created.
   *
   * @param  log          The item click log to process.
   * @param  analysis     The analysis containing the item group stats to update.
   * @param  clickIsLocal Whether the given item click log was recorded
   *                      on the current page (`true` if it was).
   */
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

  /**
   * Update an analysis by processing the given item click log.
   * This includes updating both the related item and item group stats objects,
   * which will be created if they do not exist yet.
   *
   * @param  log      The item click log to process.
   * @param  analysis The analysis to update.
   */
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

  /**
   * Update an analysis by computing the global and local click frequencies,
   * for each item with stats.
   *
   * This method must only be called once all item click logs have been processed.
   *
   * @param  analysis The analysis to update with frequencies.
   */
  private computeFrequencies (analysis: ItemClicksAnalysis) {
    for (let itemStats of analysis.itemStats.values()) {
      itemStats.clickFrequency = itemStats.nbClicks / analysis.totalNbClicks;
      itemStats.localClickFrequency = itemStats.localNbClicks / analysis.totalLocalNbClicks;
    }
  }

  /**
   * Create, compute and return a fresh item clicks analysis,
   * by processing all item click logs of the database.
   *
   * @return An up-to-date analysis of the database item click logs.
   */
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


  // ======================================================== STATIC METHODS ===

  /**
   * Split a list of items into two sub-lists:
   * - a sub-list with items whose stats are available in the given analysis;
   * - a sub-list with the other items (with no stats).
   *
   * The order of the initial list is respected in each of the sub-lists.
   *
   * @param  items    The list of items to split.
   * @param  analysis The analysis where to look for item stats.
   * @return          An object with the two sub-lists of items.
   */
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

  /**
   * Split a list of groups into two sub-lists:
   * - a sub-list with groups whose stats are available in the given analysis;
   * - a sub-list with the other groups (with no stats).
   *
   * The order of the initial list is respected in each of the sub-lists.
   *
   * @param  groups   The list of groups to split.
   * @param  analysis The analysis where to look for item stats.
   * @return          An object with the two sub-lists of items.
   */
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
