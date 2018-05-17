import * as $ from "jquery";
import { ItemListPolicy } from "./ItemListPolicy";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";
import { SortByLinkedPagePolicy, GenericPagePayload } from "./SortByLinkedPagePolicy";


export interface PagePayload extends GenericPagePayload {
  nbVisits: number;
}


export class MostVisitedPagesPolicy extends SortByLinkedPagePolicy<PagePayload> {

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
