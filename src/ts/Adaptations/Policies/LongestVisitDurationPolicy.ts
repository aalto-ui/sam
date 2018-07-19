import { LinkedPageScorePolicy } from "./LinkedPageScorePolicy";


export class LongestVisitDurationPolicy extends LinkedPageScorePolicy {

  readonly name: string = "Longest visit duration";

  constructor () {
    super();
  }

  protected computePageScore (pageID: string): number {
    return this.pageVisitsAnalysis.pageStats[pageID].totalVisitDuration;
  }
}
