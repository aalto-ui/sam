import { SortByLinkedPagePolicy, GenericPagePayload } from "./SortByLinkedPagePolicy";


export interface PagePayload extends GenericPagePayload {
  nbVisits: number;
}


export class MostVisitedPagesPolicy extends SortByLinkedPagePolicy<PagePayload> {

  readonly name: string = "Most visited pages";

  constructor () {
    super();
  }

  protected createPagePayload (pathname: string): PagePayload {
    return {
      pathname: pathname,
      nbVisits: this.pageVisitsAnalysis.pageStats[pathname].nbVisits
    };
  }

  protected comparePagePayloads(payload1: PagePayload, payload2: PagePayload): number {
    return payload2.nbVisits - payload1.nbVisits;
  }
}
