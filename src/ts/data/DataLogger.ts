import * as $ from "jquery";
import { Database } from "./Database";
import { MenuManager } from "../elements/MenuManager";
import { Menu, MenuID } from "../elements/Menu";
import { GroupID } from "../elements/ItemGroup";
import { Item, ItemID } from "../elements/Item";
import { Utilities, PageID } from "../Utilities";


// Interfaces of available logs, stored in the database
export interface ItemClickLog {
  readonly itemID: ItemID;
  readonly groupID: GroupID;
  readonly menuID: MenuID;
  readonly timestamp: number;
  readonly pageID: PageID;
}

export interface PageVisitLog {
  readonly timestamp: number;
  readonly pageID: PageID;
  readonly duration: number;
}


export class DataLogger {

  /*************************************************************** PROPERTIES */

  // The database to use for logging
  private readonly database: Database;

  // Timestamp on page load
  private readonly pageLoadTimestamp: number;

  // Map from item IDs to (on)click callbacks
  // (references to callbacks are required to detach an event handler)
  private readonly itemClickCallbacks: Map<string, (event) => void>;


  /************************************************************** CONSTRUCTOR */

  constructor (database: Database, menuManager: MenuManager) {
    this.database = database;
    this.pageLoadTimestamp = Date.now();
    this.itemClickCallbacks = new Map();

    this.init(menuManager);
  }


  /****************************************************************** METHODS */

  init (menuManager: MenuManager) {
    this.startListeningForAllMenusItemClicks(menuManager);
    this.startListeningForPageBeforeUnload();
  }


  /****************************************************************************/
  /* Item click handling
  /****************************************************************************/

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

  startListeningForAllMenusItemClicks (menuManager: MenuManager) {
    let items = menuManager.getAllItems();
    this.startListeningForItemClicks(items);
  }

  stopListeningForAllMenusItemClicks (menuManager: MenuManager) {
    let items = menuManager.getAllItems();
    this.stopListeningForItemClicks(items);
  }

  onMenuItemClick (event: JQuery.Event, item: Item) {
    this.database.logItemClick({
      itemID: item.id,
      groupID: item.parent.id,
      menuID: item.parent.parent.id,
      timestamp: event.timeStamp,
      pageID: Utilities.getCurrentPageID()
    });
  }


  /****************************************************************************/
  /* Page beforeunload handling
  /****************************************************************************/

  startListeningForPageBeforeUnload () {
    let self = this;

    $(window).on("beforeunload", (event) => {
      self.onPageBeforeUnload(event);
    });
  }

  onPageBeforeUnload (event: JQuery.Event) {
    this.database.logPageVisit({
      timestamp: this.pageLoadTimestamp,
      pageID: Utilities.getCurrentPageID(),
      duration: event.timeStamp
    });
  }
}
