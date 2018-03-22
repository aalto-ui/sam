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
    // Get the related item, group and menu tags
    function getTag (name: string) {
      return $(event.target).closest(`[data-awm-${name}]`).attr(`data-awm-${name}`);
    }

    let itemTag = getTag("item");
    let groupTag = getTag("group");
    let menuTag = getTag("menu");

    // Also get the event timestamp and the current url pathname
    let timestamp = event.timeStamp;
    let pathname = window.location.pathname;

    console.log(itemTag, groupTag, menuTag, timestamp, pathname);

    // Log all this in the database
    // TODO
  }

  logCurrentPageVisit () {
    let pathname = window.location.pathname;

    console.log(pathname);

    // Log all this in the database
    // TODO
  }
}
