import { LinkedPageScorePolicy } from "./LinkedPageScorePolicy";
import { PageID } from "../../Utilities";


export class MostVisitedPagesPolicy extends LinkedPageScorePolicy {

  // ============================================================ PROPERTIES ===

  readonly name: string = "Most visited pages";


  // =========================================================== CONSTRUCTOR ===

  constructor () {
    super();
  }


  // =============================================================== METHODS ===

  protected computePageScore (pageID: PageID): number {
    return this.pageVisitsAnalysis.pageStats.get(pageID).nbVisits;
  }
}
