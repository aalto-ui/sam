import { Database } from "./Database";
import { DataAnalyserModule } from "./DataAnalyserModule";
import { Analysis } from "./DataAnalyser";


// Interface implemented by the page visits analysis returned by this module
export interface PageVisitsAnalysis extends Analysis {
  totalNbVisits: number,
  nbUniquePathnames: number,
  nbVisits: {[key: string]: number},
  visitFrequencies: {[key: string]: number},
  visitDurations: {[key: string]: number},
  firstVisitTimestamps: {[key: string]: number},
  lastVisitTimestamps: {[key: string]: number}
}


export class PageVisitsAnalyser extends DataAnalyserModule {
  constructor (database: Database) {
    super(database);
  }

  protected computeAnalysis (): PageVisitsAnalysis {
  // Get the data
  let pageVisitsData = this.database.getTableEntries("page-visits");
  let pageVisitDurationsData = this.database.getTableEntries("page-visit-durations");

  // Initialize the analysis object
  let analysis = {
    totalNbVisits: pageVisitsData.length,
    nbUniquePathnames: 0,
    nbVisits: {},
    visitFrequencies: {},
    visitDurations: {},
    firstVisitTimestamps: {},
    lastVisitTimestamps: {}
  };

  // Compute/update the number, frequency, primacy and recency
  // (resp. first and last visit timestamps) of visits for each page
  function processPageVisit (visit: object) {
    let pathname = visit["pathname"];

    let nbVisits = 0;
    if (analysis.nbVisits[pathname] !== undefined) {
      nbVisits = analysis.nbVisits[pathname];
    }
    else {
      // If the pathname has never been seen before, increase the nb of unique pathnames visited so far
      analysis.nbUniquePathnames += 1;
    }

    analysis.nbVisits[pathname] = nbVisits + 1;

    // Map each visited pathname to the first and last visit timestamps
    let firstTimestamp = visit["timestamp"];
    let lastTimestamp = visit["timestamp"];

    // Note: if one map has an entry for the pathname, the other must have it as well
    if (analysis.firstVisitTimestamps[pathname] !== undefined) {
      firstTimestamp = Math.min(firstTimestamp, analysis.firstVisitTimestamps[pathname]);
      lastTimestamp = Math.max(lastTimestamp, analysis.lastVisitTimestamps[pathname]);
    }

    analysis.firstVisitTimestamps[pathname] = firstTimestamp;
    analysis.lastVisitTimestamps[pathname] = lastTimestamp;

  }

  function computeFrequency (pathname: string, nbVisits: number) {
    let frequency = nbVisits / analysis.totalNbVisits;
    analysis.visitFrequencies[pathname] = frequency;
  }

  pageVisitsData.forEach(processPageVisit);

  for (let pathname in analysis.nbVisits) {
    computeFrequency(pathname, analysis.nbVisits[pathname]);
  }

  // Turn visit durations data into a map
  for (let visitedPage of pageVisitDurationsData) {
    analysis.visitDurations[visitedPage["pathname"]] = visitedPage["duration"];
  }

  return analysis;
  }
}
