import { Database, TableEntry, TableEntryIndex } from "./Database";
import { DataAnalyserModule } from "./DataAnalyserModule";
import { Analysis } from "./DataAnalyser";
import { PageVisitLog } from "./DataLogger";


export interface PageStats {
  nbVisits: number,
  visitFrequency: number,

  timestamps: number[],
  firstVisitTimestamp: number,
  lastVisitTimestamp: number,

  visitDurations: number[],
  totalVisitDuration: number,

  eventIndices: TableEntryIndex[]
}

// Interface implemented by the page visits analysis returned by this module
export interface PageVisitsAnalysis extends Analysis {
  totalNbVisits: number,
  nbUniquePathnames: number,
  pageStats: {[key: string]: PageStats},
  currentEventIndex: TableEntryIndex
}


export class PageVisitsAnalyser extends DataAnalyserModule {
  constructor (database: Database) {
    super(database);
  }

  private createPageVisitsAnalysis (): PageVisitsAnalysis {
    return {
      totalNbVisits: 0,
      nbUniquePathnames: 0,
      pageStats: {},
      currentEventIndex: this.database.getItemClickLogsCurrentIndex()
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
    let pathname = log.pathname;
    let pahtnameHasAlreadyBeenSeen = pathname in analysis.pageStats;

    // Update global visit counters
    analysis.totalNbVisits += 1;
    if (! pahtnameHasAlreadyBeenSeen) {
      analysis.nbUniquePathnames += 1;
    }

    // Create a page stats object if required
    if (! pahtnameHasAlreadyBeenSeen) {
      analysis.pageStats[pathname] = this.createPageStats();
    }

    // Update the page stats
    let pageStats = analysis.pageStats[pathname];

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
    for (let pathname in analysis.pageStats) {
      let pageStats = analysis.pageStats[pathname];

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
