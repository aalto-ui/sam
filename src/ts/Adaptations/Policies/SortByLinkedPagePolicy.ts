import * as $ from "jquery";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";
import { PageStats, PageVisitsAnalysis } from "../../Data/PageVisitsAnalyser";
import { ItemGroup } from "../../Elements/ItemGroup";
import { Policy, ItemWithScore } from "./Policy";


// Generic page payload used for sorting/scoring
// Any concrete class extending this abstract policy should extend this interface,
// and use it to parametrize the extension of the abstract class
export interface GenericPagePayload {
  pathname: string;
}


export abstract class SortByLinkedPagePolicy<P extends GenericPagePayload> extends Policy {

  // Internal list of sorted page payloads
  // This property can be used by any policy method, and is refreshed every time a new sorting occurs
  protected sortedPagePayloads: P[];

  // Internal reference to a page visit analysis
  // This property can be used by any policy method, and is refreshed every time a new sorting occurs
  protected pageVisitsAnalysis: PageVisitsAnalysis;


  constructor () {
    super();
  }

  // Abstract method which must be implemented by any concrete child class,
  // and should return a page payload object given a pathname
  protected abstract createPagePayload (pathname: string): P;

  // Abstract method which must be implemented by any concrete child class,
  // and should compare two page payload objects, according to what Array.sort method expects
  protected abstract comparePagePayloads (payload1: P, payload2: P): number;

  // Sort page stats as page payloads, which are then internally stored
  private sortPageStatsAsPagePayloads () {
    let payloads = Object.keys(this.pageVisitsAnalysis.pageStats)
      .map((stats) => {
        return this.createPagePayload(stats);
      })
      .sort((payload1, paylaod2) => {
        return this.comparePagePayloads(payload1, paylaod2);
      });

    this.sortedPagePayloads = payloads;
  }

  // Return menu items which have been sorted by the position of the pages
  // they (possibly) point to, according to the already sorted pages (payloads)
  private getItemsWithScoresSortedByPointedPages (items: Item[]): ItemWithScore[] {
    let sortedItems: Item[] = [];

    // For each page (in sorted order), attempt to find an item pointing to it
    for (let payload of this.sortedPagePayloads) {
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let matchingLinkNodes = item.findLinkNodes(payload.pathname);

        // In case there is 1+ link matching, add this item to sorted items,
        // and remove it from unsorted ones
        if (matchingLinkNodes.length > 0) {
          items.splice(i, 1);
          sortedItems.push(item);

          break;
        }
      }
    }

    // Finally return the sorted items, followed by the remaining unsorted items

    // TODO: allow child classes to define their own score?
    // NOTE: it should sum to one, hence the following
    let uniformScore = 1 / (sortedItems.length + items.length);

    return sortedItems.concat(items)
      .map((item) => {
        return {
          item: item,
          score: uniformScore
        };
      });
  }

  getSortedItemsWithScores (menus: Menu[], analyser: DataAnalyser): ItemWithScore[] {
    // First, update the related page visits analysis
    this.pageVisitsAnalysis = analyser.getPageVisitsAnalysis();

    // Then, update sorted page payloads
    this.sortPageStatsAsPagePayloads();

    // Finally, sort all items according to the sorted payloads, and return them
    let allItems = Menu.getAllMenusItems(menus);
    return this.getItemsWithScoresSortedByPointedPages(allItems);
  }
}
