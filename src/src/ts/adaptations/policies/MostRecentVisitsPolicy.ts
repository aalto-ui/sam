import { LinkedPageScorePolicy } from "./LinkedPageScorePolicy";


export class MostRecentVisitsPolicy extends LinkedPageScorePolicy {

  readonly name: string = "Most recently visited";

  constructor () {
    super();
  }

  protected computePageScore (pageID: string): number {
    return this.pageVisitsAnalysis.pageStats[pageID].lastVisitTimestamp;
  }
}
