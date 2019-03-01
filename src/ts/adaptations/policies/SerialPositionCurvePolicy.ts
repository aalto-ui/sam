/** @module adaptation */

import { LinkedPageScorePolicy } from "./LinkedPageScorePolicy";
import { PageID } from "../../Utilities";


export class SerialPositionCurvePolicy extends LinkedPageScorePolicy {

  // ============================================================ PROPERTIES ===

  readonly name: string = "Serial-Position curve";


  // =========================================================== CONSTRUCTOR ===

  constructor () {
    super();
  }


  // =============================================================== METHODS ===

  /**
   * Compute and return the _familiarity_ score of the webpage with the given ID,
   * using data about the page from [[LinkedPageScorePolicy.pageVisitsAnalysis]].
   * 
   * The _familiarity_ of a page is defined as the weighted sum of:
   * - the frequency of the visits;
   * - the recency of the last visit;
   * - the primacy of the first visit.
   * 
   * @param  pageID The ID of the page to rank.
   * @return        The familiarity score of the page with the given ID.
   */
  private computeFamiliarityScore (pageID: PageID): number {
    // If there are no stats, immediately return a null score
    if (! this.pageVisitsAnalysis.pageStats.has(pageID)) {
      return 0;
    }

    let pageStats = this.pageVisitsAnalysis.pageStats.get(pageID);

    // Recency and primacy (note: lower values lead to higher score below!)
    let recency = 0;
    let primacy = 0;

    let lastVisitTimestamp = pageStats.lastVisitTimestamp;
    let firstVisitTimestamp = pageStats.firstVisitTimestamp;

    // In order to compute recency and primacy, count how many visits occured
    // (1) later for the last time and (2) earlier for the first time (than in the given page stats)
    for (let currentPageStats of this.pageVisitsAnalysis.pageStats.values()) {
      if (currentPageStats.lastVisitTimestamp > lastVisitTimestamp) {
        recency++;
      }

      if (currentPageStats.firstVisitTimestamp < firstVisitTimestamp) {
        primacy++;
      }
    }

    // Intermediate scores used to compute the familiarity score
    let frequencyScore = pageStats.visitFrequency;
    let recencyScore = (this.pageVisitsAnalysis.nbUniquePages - recency) / this.pageVisitsAnalysis.nbUniquePages;
    let primacyScore = (this.pageVisitsAnalysis.nbUniquePages - primacy) / this.pageVisitsAnalysis.nbUniquePages;

    // console.log("Frequency score:", frequencyScore);
    // console.log("Recency score:", recencyScore);
    // console.log("Primacy score:", primacyScore);

    // Familiarity score
    let familiarity = (0.4 * frequencyScore)
                    + (0.4 * recencyScore)
                    + (0.2 * primacyScore);

    return familiarity;
  }

  protected computePageScore (pageID: PageID): number {
    return this.computeFamiliarityScore(pageID);
  }
}
