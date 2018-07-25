import { LinkedPageScorePolicy } from "./LinkedPageScorePolicy";
import { PageID } from "../../Utilities";


export class MostRecentVisitsPolicy extends LinkedPageScorePolicy {

  /*************************************************************** PROPERTIES */

  readonly name: string = "Most recently visited";


  /************************************************************** CONSTRUCTOR */

  constructor () {
    super();
  }


  /****************************************************************** METHODS */

  protected computePageScore (pageID: PageID): number {
    return this.pageVisitsAnalysis.pageStats.get(pageID).lastVisitTimestamp;
  }
}
