import * as $ from "jquery";
import { Database } from "./Database";
import { Menu } from "../Menus/Menu";
import { Item } from "../Menus/Item";

export class DataLogger {
  // The database to use for logging
  private database: Database;

  // List of the current page adaptive menus
  private menus: Menu[];


  constructor (database: Database, menus: Menu[]) {
    this.database = database;
    this.menus = menus;

    this.start();
  }

  start () {
    this.startListeningForItemClicks();
    this.logCurrentPageVisit();
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
    // Get the event timestamp and the current url pathname
    let timestamp = event.timeStamp;
    let pathname = window.location.pathname;

    // Log all this in the database, with related IDs
    this.database.addTableEntry("item-clicks", {
      timestamp: timestamp,
      pathname: pathname,
      IDs: {
        item: item.getID(),
        group: item.parent.getID(),
        menu: item.parent.parent.getID()
      }
    });
  }

  logCurrentPageVisit () {
    // Get the event timestamp and the current url pathname
    let timestamp = Date.now();
    let pathname = window.location.pathname;

    this.database.addTableEntry("page-visits", {
      timestamp: timestamp,
      pathname: pathname
    });
  }
}
