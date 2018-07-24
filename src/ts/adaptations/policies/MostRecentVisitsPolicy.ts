import { LinkedPageScorePolicy } from "./LinkedPageScorePolicy";
import { PageID } from "../../Utilities";


export class MostRecentVisitsPolicy extends LinkedPageScorePolicy {

  readonly name: string = "Most recently visited";

  constructor () {
    super();
  }

  protected computePageScore (pageID: PageID): number {
    return this.pageVisitsAnalysis.pageStats[pageID].lastVisitTimestamp;
  }
}
