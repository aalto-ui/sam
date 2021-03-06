/** @module adaptation */

import { LinkedPageScorePolicy } from "./LinkedPageScorePolicy";
import { PageID } from "../../Utilities";


export class MostVisitedPagesPolicy extends LinkedPageScorePolicy {

  // ============================================================ PROPERTIES ===

  readonly name: string = "Most visited pages";


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of MostVIsitedPagesPolicy.
   */
  constructor () {
    super();
  }


  // =============================================================== METHODS ===

  protected computePageScore (pageID: PageID): number {
    return this.pageVisitsAnalysis.pageStats.get(pageID).nbVisits;
  }
}
