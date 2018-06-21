import * as $ from "jquery";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { SortByLinkedPagePolicy, GenericPagePayload } from "./SortByLinkedPagePolicy";


export interface PagePayload extends GenericPagePayload {
  duration: number;
}


export class LongestVisitDurationPolicy extends SortByLinkedPagePolicy<PagePayload> {

  constructor () {
    super();
  }

  protected createPagePayload (pathname: string): PagePayload {
    return {
      pathname: pathname,
      duration: this.pageVisitsAnalysis.pageStats[pathname].totalVisitDuration
    };
  }

  protected comparePagePayloads(payload1: PagePayload, payload2: PagePayload): number {
    return payload2.duration - payload1.duration;
  }
}
