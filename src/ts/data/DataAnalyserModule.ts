import { Database } from "./Database";


// Generic interface of an analysis returned by an analyser module
export interface Analysis { }


export abstract class DataAnalyserModule<A extends Analysis> {
  // The database to fetch data from, and the revision of the latest data fetched
  protected readonly database: Database;

  // Cached version of the last analysis, and related source database revision
  private cachedAnalysis: A | null;
  private cachedAnalysisContentRevision: number;

  constructor (database: Database) {
    this.database = database;

    this.cachedAnalysis = null;
    this.cachedAnalysisContentRevision = 0;
  }

  // Return true if there has not been any analysis done yet,
  // or if the cached version is outdated and needs to be recomputed
  // Otherwise, return false
  private needsAnalysisUpdate (): boolean {
    return this.cachedAnalysis === null
        || this.cachedAnalysisContentRevision !== this.database.getCurrentRevision();
  }

  // Update the content revision with the current one of the database
  private updateContentRevision () {
    this.cachedAnalysisContentRevision = this.database.getCurrentRevision();
  }

  // Return a deep copy of the given analysis
  // This method should be overidden by concrete child classes with special needs,
  // e.g. to make deep copies of data structures not handled by JSON (de)serialization
  protected makeAnalysisDeepCopy (analysis: A): A {
    return JSON.parse(JSON.stringify(analysis));
  }

  // If the cached version is up to date, return a copy of it
  // Otherwise, recompute it first, then return a copy of it
  getAnalysis (): A {
    if (this.needsAnalysisUpdate()) {
      this.updateContentRevision();
      this.cachedAnalysis = this.computeAnalysis();
    }

    return this.makeAnalysisDeepCopy(this.cachedAnalysis);
  }

  // Abstract method which must be implemented by any concrete child class,
  // and should actually compute and return the analysis
  protected abstract computeAnalysis (): A;
}
