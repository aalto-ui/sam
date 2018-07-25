import { LinkedPageScorePolicy } from "./LinkedPageScorePolicy";
import { PageID } from "../../Utilities";


export class LongestVisitDurationPolicy extends LinkedPageScorePolicy {

  /*************************************************************** PROPERTIES */

  readonly name: string = "Longest visit duration";


  /************************************************************** CONSTRUCTOR */

  constructor () {
    super();
  }


  /****************************************************************** METHODS */

  protected computePageScore (pageID: PageID): number {
    return this.pageVisitsAnalysis.pageStats.get(pageID).totalVisitDuration;
  }
}
