/** @module user-data */

import * as $ from "jquery";
import { Database } from "./Database";
import { MenuManager } from "../elements/MenuManager";
import { Menu, MenuID } from "../elements/Menu";
import { GroupID } from "../elements/ItemGroup";
import { Item, ItemID } from "../elements/Item";
import { Utilities, PageID } from "../Utilities";


/** Interface of the log of an item click, to be stored in the database. */
export interface ItemClickLog {
  readonly itemID: ItemID;
  readonly groupID: GroupID;
  readonly menuID: MenuID;
  readonly timestamp: number;
  readonly pageID: PageID;
}

/** Interface of the log of a page visit, to be stored in the database. */
export interface PageVisitLog {
  readonly timestamp: number;
  readonly pageID: PageID;
  readonly duration: number;
}


export class DataLogger {

  // ============================================================ PROPERTIES ===

  /** Database where to store logged data. */
  private readonly database: Database;

  /**
   * Timestamp of the page load.
   * This is required to measure the visit duration on page leave.
   */
  private readonly pageLoadTimestamp: number;

  /**
   * Map from item IDs to onclick callbacks attached to them.
   * This is required to detach such handlers from the item nodes if need be.
   */
  private readonly itemClickCallbacks: Map<ItemID, (event) => void>;


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of data logger.
   *
   * @param database    The database where to store logged data.
   * @param menuManager The menu manager with menu items to start watching.
   */
  constructor (database: Database, menuManager: MenuManager) {
    this.database = database;
    this.pageLoadTimestamp = Date.now();
    this.itemClickCallbacks = new Map();

    this.init(menuManager);
  }


  // =============================================================== METHODS ===

  /**
   * Start logging item clicks and page visits.
   *
   * @param  menuManager The menu manager with menu items to watch.
   */
  init (menuManager: MenuManager) {
    this.startListeningForAllMenusItemClicks(menuManager);
    this.startListeningForPageBeforeUnload();
  }


  // ===========================================================================
  // Item click handling
  // ===========================================================================

  /**
   * Start logging clicks on the nodes of the given items.
   *
   * @param  items The items to start watching.
   */
  startListeningForItemClicks (items: Item[]) {
    let self = this;

    for (let item of items) {
      let callback = (event) => {
        self.onMenuItemClick(event, item);
      };

      this.itemClickCallbacks.set(item.id, callback);
      item.node.on("click", callback);
    }
  }

  /**
   * Stop logging clicks on the nodes of the given items.
   *
   * @param  items The items to stop watching.
   */
  stopListeningForItemClicks (items: Item[]) {
    for (let item of items) {
      let callback = this.itemClickCallbacks.get(item.id);
      this.itemClickCallbacks.delete(item.id);

      item.node.off("click", callback);
    }
  }

  /**
   * Start logging clicks on the nodes of all the items of the given menu.
   *
   * @param  menu The menu containing items to start watching.
   */
  startListeningForMenuItemClicks (menu: Menu) {
    let items = menu.getAllItems();
    this.startListeningForItemClicks(items);
  }

  /**
   * Stop logging clicks on the nodes of all the items of the given menu.
   *
   * @param  menu The menu containing items to stop watching.
   */
  stopListeningForMenuItemClicks (menu: Menu) {
    let items = menu.getAllItems();
    this.stopListeningForItemClicks(items);
  }

  /**
   * Start logging clicks on the nodes of all the items of all menus.
   *
   * @param  menuManager The menu manager handling all the items to start watching.
   */
  startListeningForAllMenusItemClicks (menuManager: MenuManager) {
    let items = menuManager.getAllItems();
    this.startListeningForItemClicks(items);
  }

  /**
   * Stop logging clicks on the nodes of all the items of all menus.
   *
   * @param  menuManager The menu manager handling all the items to stop watching.
   */
  stopListeningForAllMenusItemClicks (menuManager: MenuManager) {
    let items = menuManager.getAllItems();
    this.stopListeningForItemClicks(items);
  }

  /**
   * Handle an item click (`click` event) by logging it into the database.
   *
   * @param  event The `click` event issued on the item node click.
   * @param  item  The clicked item.
   */
  onMenuItemClick (event: JQuery.Event, item: Item) {
    this.database.logItemClick({
      itemID: item.id,
      groupID: item.parent.id,
      menuID: item.parent.parent.id,
      timestamp: event.timeStamp,
      pageID: Utilities.getCurrentPageID()
    });
  }


  // ===========================================================================
  // Page beforeunload handling
  // ===========================================================================

  /**
   * Start logging the current page visit by listening for a `beforeunload` event.
   */
  startListeningForPageBeforeUnload () {
    let self = this;

    $(window).on("beforeunload", (event) => {
      self.onPageBeforeUnload(event);
    });
  }

  /**
   * Handle a page leave (`beforeunload event) by logging the visit into the database.
   *
   * @param  event The `beforeunload` event issued on the page leave.
   */
  onPageBeforeUnload (event: JQuery.Event) {
    this.database.logPageVisit({
      timestamp: this.pageLoadTimestamp,
      pageID: Utilities.getCurrentPageID(),
      duration: event.timeStamp
    });
  }
}
