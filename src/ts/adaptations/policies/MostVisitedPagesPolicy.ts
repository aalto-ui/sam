import { LinkedPageScorePolicy } from "./LinkedPageScorePolicy";
import { PageID } from "../../Utilities";


export class MostVisitedPagesPolicy extends LinkedPageScorePolicy {

  readonly name: string = "Most visited pages";

  constructor () {
    super();
  }

  protected computePageScore (pageID: PageID): number {
    return this.pageVisitsAnalysis.pageStats.get(pageID).nbVisits;
  }
}
