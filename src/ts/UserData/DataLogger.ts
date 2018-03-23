import * as $ from "jquery";
import { Database } from "./Database";

export class DataLogger {
  // The database to use for logging
  private database: Database;

  // The callback method to use to log clicks on items
  private itemClickCallback = (event) => { this.onMenuItemClick(event); };


  constructor (database: Database) {
    this.database = database;

    this.start();
  }

  start () {
    this.startListeningForItemClicks();
    this.logCurrentPageVisit();
  }

  stop () {
    this.stopListeningForPageLoads();
  }

  startListeningForItemClicks () {
    console.log($("[data-awm-item]"));
    $("[data-awm-item]").on("click", this.itemClickCallback);
  }

  stopListeningForPageLoads () {
    $("[data-awm-item]").off("click", this.itemClickCallback);
  }

  onMenuItemClick (event: JQuery.Event) {
    // Get the event timestamp and the current url pathname
    let timestamp = event.timeStamp;
    let pathname = window.location.pathname;

    // Get the related item, group and menu tags
    function getTag (name: string) {
      return $(event.target).closest(`[data-awm-${name}]`).attr(`data-awm-${name}`);
    }

    let itemTag = getTag("item");
    let groupTag = getTag("group");
    let menuTag = getTag("menu");

    // Log all this in the database
    this.database.addTableEntry("item-clicks", {
      timestamp: timestamp,
      pathname: pathname,
      itemTag: itemTag,
      groupTag: groupTag,
      menuTag: menuTag
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
