import * as $ from "jquery";
import { Database } from "./Database";
import { Menu } from "../Elements/Menu";
import { Item } from "../Elements/Item";


// Interfaces of available logs, stored in the database
export interface ItemClickLog {
  readonly itemID: string,
  readonly groupID: string,
  readonly menuID: string,
  readonly timestamp: number,
  readonly pathname: string
}

export interface PageVisitLog {
  readonly timestamp: number,
  readonly pathname: string,
  readonly duration: number
}


export class DataLogger {
  // The database to use for logging
  private database: Database;

  // List of the current page adaptive menus
  private menus: Menu[];

  // Timestamp on page load
  private pageLoadTimestamp: number;


  constructor (database: Database, menus: Menu[]) {
    this.database = database;
    this.menus = menus;
    this.pageLoadTimestamp = Date.now();

    this.start();
  }

  start () {
    this.startListeningForItemClicks();
    this.startListeningForPageBeforeUnload();
  }

  startListeningForItemClicks () {
    let self = this;
    let allItems = Menu.getAllMenusItems(this.menus);

    for (let item of allItems) {
      item.node.on("click", function (event) {
        self.onMenuItemClick(event, item);
      });
    }
  }

  onMenuItemClick (event: JQuery.Event, item: Item) {
    this.database.logItemClick({
      itemID: item.id,
      groupID: item.parent.id,
      menuID: item.parent.parent.id,
      timestamp: event.timeStamp,
      pathname: window.location.pathname
    });
  }

  startListeningForPageBeforeUnload () {
    let self = this;

    $(window).on("beforeunload", function (event) {
      self.onPageBeforeUnload(event);
    });
  }

  onPageBeforeUnload (event: JQuery.Event) {
    this.database.logPageVisit({
      timestamp: this.pageLoadTimestamp,
      pathname: window.location.pathname,
      duration: event.timeStamp - this.pageLoadTimestamp
    });
  }
}
