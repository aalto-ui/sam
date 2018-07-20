import { LinkedPageScorePolicy } from "./LinkedPageScorePolicy";


export class MostVisitedPagesPolicy extends LinkedPageScorePolicy {

  readonly name: string = "Most visited pages";

  constructor () {
    super();
  }

  protected computePageScore (pageID: string): number {
    return this.pageVisitsAnalysis.pageStats[pageID].nbVisits;
  }
}
