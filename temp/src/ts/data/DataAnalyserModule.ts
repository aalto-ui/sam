import { Database } from "./Database";
import { Analysis } from "./DataAnalyser";


export abstract class DataAnalyserModule {
  // The database to fetch data from, and the revision of the latest data fetched
  protected readonly database: Database;

  // Cached version of the last analysis, and related source database revision
  private cachedAnalysis: Analysis | null;
  private cachedAnalysisContentRevision: number;

  constructor (database: Database) {
    this.database = database;

    this.cachedAnalysis = null;
    this.cachedAnalysisContentRevision = 0;
  }

  // Return true if there has not been any analysis done yet,
  // or if the cached version is outdated and needs to be recomputed
  // Otherwise, return false
  private needsAnalysisUpdate () {
    return this.cachedAnalysis === null
        || this.cachedAnalysisContentRevision !== this.database.getCurrentRevision();
  }

  // Update the content revision with the current one of the database
  private updateContentRevision () {
    this.cachedAnalysisContentRevision = this.database.getCurrentRevision();
  }

  // If the cached version is up to date, return a copy of it
  // Otherwise, recompute it first, then return a copy of it
  getAnalysis () {
    if (this.needsAnalysisUpdate()) {
      this.updateContentRevision();
      this.cachedAnalysis = this.computeAnalysis();
    }

    return JSON.parse(JSON.stringify(this.cachedAnalysis));
  }

  // Abstract method which must be implemented by any concrete child class,
  // and should actually compute and return the analysis
  protected abstract computeAnalysis (): Analysis;
}
