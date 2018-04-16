import * as $ from "jquery";
import { Database } from "./Database";
import { Menu } from "../Elements/Menu";
import { Item } from "../Elements/Item";

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

  startListeningForPageBeforeUnload () {
    let self = this;

    $(window).on("beforeunload", function (event) {
      self.onPageBeforeUnload(event);
    });
  }

  onMenuItemClick (event: JQuery.Event, item: Item) {
    // Get the event timestamp, current url pathname and compute element IDs
    let timestamp = event.timeStamp;
    let pathname = window.location.pathname;

    let IDs = {
      item: item.id,
      group: item.parent.id,
      menu: item.parent.parent.id
    };

    // Log the item click
    this.database.addTableEntry("item-clicks", {
      timestamp: timestamp,
      pathname: pathname,
      IDs: IDs
    });

    // Set or update the item click number
    function entrySelector (entry) {
      return entry.IDs.item === item.id;
    }

    if (this.database.hasTableEntry("item-nb-clicks", entrySelector)) {
      this.database.editTableEntries("item-nb-clicks", (entry) => {
        entry.nbClicks += 1;
      }, entrySelector);
    }
    else {
      this.database.addTableEntry("item-nb-clicks", {
        nbClicks: 1,
        IDs: IDs
      });
    }
  }

  onPageBeforeUnload (event: JQuery.Event) {
    let pathname = window.location.pathname;
    let currentVisitTime = Date.now() - this.pageLoadTimestamp;

    // Set or update the time spent on current page
    function entrySelector (entry) {
      return entry.pathname === pathname;
    }

    if (this.database.hasTableEntry("page-visit-durations", entrySelector)) {
      this.database.editTableEntries("page-visit-durations", (entry) => {
        entry.duration += currentVisitTime;
      }, entrySelector);
    }
    else {
      this.database.addTableEntry("page-visit-durations", {
        pathname: pathname,
        duration: currentVisitTime
      });
    }
  }

  logCurrentPageVisit () {
    // Get the event timestamp and the current url pathname
    let timestamp = Date.now();
    let pathname = window.location.pathname;

    // Log it as a delayed addition to the database
    // This prevents current page visit to be taken into account
    // when the database data is analyzed on page load!
    this.database.delayTableEntryAddition("page-visits", {
      timestamp: timestamp,
      pathname: pathname
    });
  }
}
