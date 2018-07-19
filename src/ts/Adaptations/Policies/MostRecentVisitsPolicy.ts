import { SortByLinkedPagePolicy, GenericPagePayload } from "./SortByLinkedPagePolicy";


export interface PagePayload extends GenericPagePayload {
  lastVisitTimestamp: number;
}


export class MostRecentVisitsPolicy extends SortByLinkedPagePolicy<PagePayload> {

  readonly name: string = "Most recently visited";

  constructor () {
    super();
  }

  protected createPagePayload (pathname: string): PagePayload {
    return {
      pathname: pathname,
      lastVisitTimestamp: this.pageVisitsAnalysis.pageStats[pathname].lastVisitTimestamp
    };
  }

  protected comparePagePayloads(payload1: PagePayload, payload2: PagePayload): number {
    return payload1.lastVisitTimestamp - payload2.lastVisitTimestamp;
  }
}
