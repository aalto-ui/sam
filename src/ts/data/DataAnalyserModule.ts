import { Database } from "./Database";


// Generic interface of an analysis returned by an analyser module
export interface Analysis { }


export abstract class DataAnalyserModule<A extends Analysis> {

  // ============================================================ PROPERTIES ===

  /**
   * Database where to fetch data to analyse (and the revisions).
   */
  protected readonly database: Database;

  /**
   * Cached version of the last analysis produced by the module.
   * Before the first analysis computation, it is set to `null`.
   */
  private cachedAnalysis: A | null;

  /**
   * Database revision of the data used to compute the cached analysis.
   */
  private cachedAnalysisContentRevision: number;


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of data analyser module.
   *
   * @param database The database where to fetch data to analyse.
   */
  constructor (database: Database) {
    this.database = database;

    this.cachedAnalysis = null;
    this.cachedAnalysisContentRevision = 0;
  }


  // =============================================================== METHODS ===

  /**
   * Test whether the analysis needs to be updated (computed anew):
   * - If no analysis has been computed yet;
   * - Or if the revision has changed since the last cached analysis computation.
   *
   * @return `true` if it needs to be updated, `false` otherwise.
   */
  private needsAnalysisUpdate (): boolean {
    return this.cachedAnalysis === null
        || this.cachedAnalysisContentRevision !== this.database.getCurrentRevision();
  }

  /**
   * Update the revision asssociated with the last cached analysis,
   * using the current revision of the database.
   */
  private updateContentRevision () {
    this.cachedAnalysisContentRevision = this.database.getCurrentRevision();
  }

  /**
   * Make a deep copy of the given analysis.
   *
   * This method should be overidden by any concrete analyser module if need be,
   * e.g. to make deep copies of data structures not handled by
   * the JSON (de)serialization copy technique implemented by default.
   *
   * @param  analysis The analysis to copy.
   * @return          A deep copy of the given analysis.
   */
  protected makeAnalysisDeepCopy (analysis: A): A {
    return JSON.parse(JSON.stringify(analysis));
  }

  /**
   * Update the cached analysis if need be, and returns a deep copy of it.
   *
   * @return An up-to-date, deep copy of the cached analysis.
   */
  getAnalysis (): A {
    if (this.needsAnalysisUpdate()) {
      this.updateContentRevision();
      this.cachedAnalysis = this.computeAnalysis();
    }

    return this.makeAnalysisDeepCopy(this.cachedAnalysis);
  }

  /**
   * Compute and return an analysis from the database data.
   *
   * Each concrete analyser module must return a fresh analysis,
   * of the analysis type [[A]] (extending [[Analysis]]) they offer.
   *
   * @return An up-to-date analysis of the database data.
   */
  protected abstract computeAnalysis (): A;
}
