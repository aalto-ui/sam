import { Database, TableEntry, TableEntryIndex } from "./Database";
import { DataAnalyserModule, Analysis } from "./DataAnalyserModule";
import { PageVisitLog } from "./DataLogger";
import { PageID } from "../Utilities";


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

// Interface implemented by the page visits analysis returned by this module
export interface PageVisitsAnalysis extends Analysis {
  totalNbVisits: number;
  nbUniquePages: number;
  pageStats: Map<PageID, PageStats>;
  currentEventIndex: TableEntryIndex;
}


export class PageVisitsAnalyser extends DataAnalyserModule<PageVisitsAnalysis> {

  /*************************************************************** PROPERTIES */

  /************************************************************** CONSTRUCTOR */

  constructor (database: Database) {
    super(database);
  }


  /****************************************************************** METHODS */

  private createPageVisitsAnalysis (): PageVisitsAnalysis {
    return {
      totalNbVisits: 0,
      nbUniquePages: 0,
      pageStats: new Map(),
      currentEventIndex: this.database.getItemClickLogsCurrentIndex()
    };
  }

  protected makeAnalysisDeepCopy (analysis: PageVisitsAnalysis): PageVisitsAnalysis {
    return {
      totalNbVisits: analysis.totalNbVisits,
      nbUniquePages: analysis.nbUniquePages,
      pageStats: new Map(analysis.pageStats),
      currentEventIndex: analysis.currentEventIndex
    };
  }


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

  private computeFrequencies (analysis: PageVisitsAnalysis) {
    for (let pageStats of analysis.pageStats.values()) {
      pageStats.visitFrequency = pageStats.nbVisits / analysis.totalNbVisits;
    }
  }

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
