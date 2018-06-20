import * as $ from "jquery";
import { ItemListPolicy } from "./ItemListPolicy";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { SortByLinkedPagePolicy, GenericPagePayload } from "./SortByLinkedPagePolicy";
import { PageStats } from "../../Data/PageVisitsAnalyser";


export interface PagePayload extends GenericPagePayload {
  familiarity: number;
}


export class SerialPositionCurvePolicy extends SortByLinkedPagePolicy<PagePayload> {

  constructor () {
    super();
  }

  private computeFamiliarityScore (pageStats: PageStats): number {
    // Recency and primacy (note: lower values lead to higher score below!)
    let recency = 0;
    let primacy = 0;

    let lastVisitTimestamp = pageStats.lastVisitTimestamp
    let firstVisitTimestamp = pageStats.firstVisitTimestamp;

    // In order to compute recency and primacy, count how many visits occured
    // (1) later for the last time and (2) earlier for the first time (than in the given page stats)
    for (let pathname in this.pageVisitsAnalysis.pageStats) {
      let currentPageStats = this.pageVisitsAnalysis.pageStats[pathname];

      if (currentPageStats.lastVisitTimestamp > lastVisitTimestamp) {
        recency++;
      }

      if (currentPageStats.firstVisitTimestamp < firstVisitTimestamp) {
        primacy++;
      }
    }

    // Intermediate scores used to compute the familiarity score
    let frequencyScore = pageStats.visitFrequency;
    let recencyScore = (this.pageVisitsAnalysis.nbUniquePathnames - recency) / this.pageVisitsAnalysis.nbUniquePathnames;
    let primacyScore = (this.pageVisitsAnalysis.nbUniquePathnames - primacy) / this.pageVisitsAnalysis.nbUniquePathnames;

    // console.log("Frequency score:", frequencyScore);
    // console.log("Recency score:", recencyScore);
    // console.log("Primacy score:", primacyScore);

    // Familiarity score
    let familiarity = (0.4 * frequencyScore)
                    + (0.4 * recencyScore)
                    + (0.2 * primacyScore);

    return familiarity;
  }

  protected createPagePayload (pathname: string): PagePayload {
    let familiarity = this.computeFamiliarityScore(this.pageVisitsAnalysis.pageStats[pathname]);

    return {
      pathname: pathname,
      familiarity: familiarity
    };
  }

  protected comparePagePayloads(payload1: PagePayload, payload2: PagePayload): number {
    return payload2.familiarity - payload1.familiarity;
  }
}
