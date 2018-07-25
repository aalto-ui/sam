import { LinkedPageScorePolicy } from "./LinkedPageScorePolicy";
import { PageID } from "../../Utilities";


export class SerialPositionCurvePolicy extends LinkedPageScorePolicy {

  readonly name: string = "Serial-Position curve";

  constructor () {
    super();
  }

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
