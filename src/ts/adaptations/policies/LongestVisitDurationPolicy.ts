import { LinkedPageScorePolicy } from "./LinkedPageScorePolicy";
import { PageID } from "../../Utilities";


export class LongestVisitDurationPolicy extends LinkedPageScorePolicy {

  readonly name: string = "Longest visit duration";

  constructor () {
    super();
  }

  protected computePageScore (pageID: PageID): number {
    return this.pageVisitsAnalysis.pageStats.get(pageID).totalVisitDuration;
  }
}
