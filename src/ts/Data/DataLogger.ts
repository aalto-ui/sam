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

  // Timestamp on page load
  private pageLoadTimestamp: number;

  // Map from item IDs to (on)click callbacks
  // (references to callbacks are required to detach an event handler)
  private itemClickCallbacks: Map<string, (event) => void>;


  constructor (database: Database, menus: Menu[]) {
    this.database = database;
    this.pageLoadTimestamp = Date.now();
    this.itemClickCallbacks = new Map();

    this.init(menus);
  }

  init (menus: Menu[]) {
    this.startListeningForAllMenusItemClicks(menus);
    this.startListeningForPageBeforeUnload();
  }

  startListeningForItemClicks (items: Item[]) {
    let self = this;

    for (let item of items) {
      let callback = function (event) {
        self.onMenuItemClick(event, item);
      };

      this.itemClickCallbacks.set(item.id, callback);
      item.node.on("click", callback);
    }
  }

  stopListeningForItemClicks (items: Item[]) {
    for (let item of items) {
      let callback = this.itemClickCallbacks.get(item.id);
      this.itemClickCallbacks.delete(item.id);

      item.node.off("click", callback);
    }
  }

  startListeningForMenuItemClicks (menu: Menu) {
    let items = menu.getAllItems();
    this.startListeningForItemClicks(items);
  }

  stopListeningForMenuItemClicks (menu: Menu) {
    let items = menu.getAllItems();
    this.stopListeningForItemClicks(items);
  }

  startListeningForAllMenusItemClicks (menus: Menu[]) {
    let items = Menu.getAllMenusItems(menus);
    this.startListeningForItemClicks(items);
  }

  stopListeningForAllMenusItemClicks (menus: Menu[]) {
    let items = Menu.getAllMenusItems(menus);
    this.stopListeningForItemClicks(items);
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
