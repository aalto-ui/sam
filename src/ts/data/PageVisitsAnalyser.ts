import { Database, TableEntry, TableEntryIndex } from "./Database";
import { DataAnalyserModule, Analysis } from "./DataAnalyserModule";
import { PageVisitLog } from "./DataLogger";
import { PageID } from "../Utilities";


/** Interface of the visit-related statistics of a webpage. */
export interface PageStats {
  nbVisits: number;
  visitFrequency: number;

  timestamps: number[];
  firstVisitTimestamp: number;
  lastVisitTimestamp: number;

  visitDurations: number[];
  totalVisitDuration: number;

  eventIndices: TableEntryIndex[];
}

/**
 * Interface of the analysis of page visits.
 * It describes the structure of the object computed by the page visits analyser module.
 */
export interface PageVisitsAnalysis extends Analysis {
  totalNbVisits: number;
  nbUniquePages: number;
  pageStats: Map<PageID, PageStats>;
  currentEventIndex: TableEntryIndex;
}


export class PageVisitsAnalyser extends DataAnalyserModule<PageVisitsAnalysis> {

  // ============================================================ PROPERTIES ===

  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of page visits analyser.
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
   * Create an initialized page visits analysis object.
   *
   * @return A fresh page visits analysis object.
   */
  private createPageVisitsAnalysis (): PageVisitsAnalysis {
    return {
      totalNbVisits: 0,
      nbUniquePages: 0,
      pageStats: new Map(),
      currentEventIndex: this.database.getItemClickLogsCurrentIndex()
    };
  }

  /**
   * Create an initialized page stats object.
   *
   * @return A fresh page stats object.
   */
  private createPageStats (): PageStats {
    return {
      nbVisits: 0,
      visitFrequency: 0,

      timestamps: [],
      firstVisitTimestamp: Number.MAX_SAFE_INTEGER,
      lastVisitTimestamp: 0,

      visitDurations: [],
      totalVisitDuration: 0,

      eventIndices: []
    };
  }

  /**
   * Make a deep copy of the given analysis.
   * Overriden method with a manual field-by-field copy (to handle Map objets).
   *
   * @param  analysis The analysis top copy.
   * @return          A deep copy of the given analysis.
   */
  protected makeAnalysisDeepCopy (analysis: PageVisitsAnalysis): PageVisitsAnalysis {
    return {
      totalNbVisits: analysis.totalNbVisits,
      nbUniquePages: analysis.nbUniquePages,
      pageStats: new Map(analysis.pageStats),
      currentEventIndex: analysis.currentEventIndex
    };
  }


  // ===========================================================================
  // Stats computation
  // ===========================================================================

  /**
   * Update an analysis by processing the given page visit log.
   *
   * @param  log      The page visit log to process.
   * @param  analysis The analysis to update.
   */
  private processPageVisitLog (log: TableEntry<PageVisitLog>, analysis: PageVisitsAnalysis) {
    let pageID = log.pageID;
    let pageHasAlreadyBeenSeen = analysis.pageStats.has(pageID);

    // Update global visit counters
    analysis.totalNbVisits += 1;
    if (! pageHasAlreadyBeenSeen) {
      analysis.nbUniquePages += 1;
    }

    // Create a page stats object if required
    if (! pageHasAlreadyBeenSeen) {
      analysis.pageStats.set(pageID, this.createPageStats());
    }

    // Update the page stats
    let pageStats = analysis.pageStats.get(pageID);

    pageStats.nbVisits += 1;

    let timestamp = log.timestamp;
    pageStats.timestamps.push(timestamp);
    pageStats.firstVisitTimestamp = Math.min(timestamp, pageStats.firstVisitTimestamp);
    pageStats.lastVisitTimestamp = Math.max(timestamp, pageStats.lastVisitTimestamp);

    let duration = log.duration;
    pageStats.visitDurations.push(duration);
    pageStats.totalVisitDuration += duration;

    pageStats.eventIndices.push(log.index);
  }

  /**
   * Update an analysis by computing the page visit frequencies, for each page with stats.
   *
   * This method must only be called once all page visit logs have been processed.
   *
   * @param  analysis The analysis to update with frequencies.
   */
  private computeFrequencies (analysis: PageVisitsAnalysis) {
    for (let pageStats of analysis.pageStats.values()) {
      pageStats.visitFrequency = pageStats.nbVisits / analysis.totalNbVisits;
    }
  }

  /**
   * Create, compute and return a fresh page visits analysis,
   * by processing all page visit logs of the database.
   *
   * @return An up-to-date analysis of the database page visit logs.
   */
  protected computeAnalysis (): PageVisitsAnalysis {
    // Get the required data
    let pageVisitLogs = this.database.getPageVisitLogs();

    // Inititalize the analysis
    let analysis = this.createPageVisitsAnalysis();

    // Fill the analysis
    for (let pageVisitLog of pageVisitLogs) {
      this.processPageVisitLog(pageVisitLog, analysis);
    }

    this.computeFrequencies(analysis);

    return analysis;
  }
}
