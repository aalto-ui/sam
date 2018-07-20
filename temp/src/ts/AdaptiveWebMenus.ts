import * as $ from "jquery";

import { Menu } from "./elements/Menu";
import { ItemGroup } from "./elements/ItemGroup";
import { Item } from "./elements/Item";
import { Database } from "./data/Database";
import { DataLogger } from "./data/DataLogger";
import { DataAnalyser } from "./data/DataAnalyser";
import { AdaptationManager } from "./adaptations/AdaptationManager";
import { DebugDisplay } from "./DebugDisplay";
import { Selector, isSelector } from "./elements/AdaptiveElement";


// Type alias used for convenience
// It represents an object who keys are menu selectors, and values are either
// generic item selectors, or specific group-items selector objects
export type MenuSelectors = {
  [key: string]: Selector | {[key: string]: Selector}
};


export class AdaptiveWebMenus {
  // List of adaptive menus
  private readonly menus: Menu[];

  // Database, logger and analyser
  private readonly database: Database;
  private readonly dataLogger: DataLogger;
  private readonly dataAnalyser: DataAnalyser;

  // Adaptation manager
  readonly adaptationManager: AdaptationManager;

  // Debug display
  private readonly debugDisplay: DebugDisplay;

  constructor (menus: Menu[] = [], debug: boolean = true) {
    this.menus = menus;

    this.database = new Database();
    this.dataLogger = new DataLogger(this.database, menus);
    this.dataAnalyser = new DataAnalyser(this.database);

    // DEBUG
    console.log("ITEM CLICK ANALYSIS", this.dataAnalyser.getItemClickAnalysis());
    console.log("PAGE VISITS ANALYSIS", this.dataAnalyser.getPageVisitsAnalysis());

    this.adaptationManager = new AdaptationManager(this.menus, this.database, this.dataAnalyser);
    this.adaptationManager.applyCurrentAdaptation();

    this.debugDisplay = new DebugDisplay(this, debug);
  }

  clearHistory () {
    this.database.empty();

    this.adaptationManager.resetCurrentAdaptation();
    this.adaptationManager.applyCurrentAdaptation();
  }

  // Add a menu to the list of menus to adapt
  // The adaptation is automatically updated to take the addition into account
  addMenu (menu: Menu) {
    this.adaptationManager.resetCurrentAdaptation();

    this.menus.push(menu);

    // Update the data logger to consider the new menu
    this.dataLogger.startListeningForMenuItemClicks(menu);

    this.adaptationManager.applyCurrentAdaptation();
  }

  // Remove the menu with the given menu ID from the list of menus to adapt
  // The adaptation is automatically updated to take the removal into account
  // If no menu is found with the given ID, nothing happens
  removeMenu (menuID: string) {
    this.adaptationManager.resetCurrentAdaptation();

    let removalIndex = this.menus.findIndex((menu) => {
      return menu.id === menuID;
    });

    if (removalIndex === -1) {
      return;
    }

    let removedMenu = this.menus.splice(removalIndex, 1);

    // Update the data logger to ignore the removed menu
    this.dataLogger.stopListeningForMenuItemClicks(removedMenu[0]);

    this.adaptationManager.applyCurrentAdaptation();
  }

  // Create an AWM instance from the given generic menu and item selectors
  // This builder methods assumes each menu is its own single group (see Menu and ItemGroup for details)
  private static fromGenericMenuAndItemSelectors (menuSelector: Selector, itemSelector: Selector): AdaptiveWebMenus {
    let menus = [];
    $(menuSelector).each(function (_, element) {
      menus.push(Menu.fromSelectors(element, itemSelector));
    });

    return new AdaptiveWebMenus(menus);
  }

  // Create an AWM instance from the given generic menu, group and item selectors
  // This method must NOT be used for menus whose group node is the same as the menu node:
  // in such a case, use fromGenericMenuAndItemSelectors instead!
  private static fromGenericMenuGroupAndItemSelectors (menuSelector: Selector, groupSelector: Selector, itemSelector: Selector): AdaptiveWebMenus {
    let menus = [];
    $(menuSelector).each(function (_, element) {
      menus.push(Menu.fromSelectors(element, groupSelector, itemSelector));
    });

    return new AdaptiveWebMenus(menus);
  }

  // Create an AWM instance from the given specific menu selectors (as keys),
  // and either specific or generic items/groups and items selectors (as values)
  private static fromSpecificSelectors (selectors: MenuSelectors): AdaptiveWebMenus {
    let menus = [];
    for (let menuSelector in selectors) {
      let descendantSelector = selectors[menuSelector];

      // Case 1: the descendant selector is a generic item selector
      if (isSelector(descendantSelector)) {
        descendantSelector = <Selector> descendantSelector;
        menus.push(Menu.fromSelectors(menuSelector, descendantSelector));
      }

      // Case 2: the descendant selector is a specific group-item selector object
      else {
        descendantSelector = <{[key: string]: Selector}> descendantSelector;
        menus.push(Menu.fromSelectors(menuSelector, descendantSelector));
      }
    }

    return new AdaptiveWebMenus(menus);
  }

  // Create an AWM instance from the given selectors
  // Refer to the specific methods for more details!
  static fromSelectors (menuSelector: Selector, itemSelector: Selector): AdaptiveWebMenus;
  static fromSelectors (menuSelector: Selector, groupSelector: Selector, itemSelector: Selector): AdaptiveWebMenus;
  static fromSelectors (selectors: MenuSelectors): AdaptiveWebMenus;

  static fromSelectors (selector1: Selector | MenuSelectors, selector2?: Selector, selector3?: Selector): AdaptiveWebMenus {
    // Case 1: called with one argument
    // It must be an object of specific selectors
    if (selector2 === undefined) {
      // console.log("fromSpecificSelectors");
      return AdaptiveWebMenus.fromSpecificSelectors(<MenuSelectors> selector1);
    }

    // Case 2: called with two arguments
    // They must resp. be a generic menu selector and a generic item selector
    if (selector3 === undefined) {
      // console.log("fromGenericMenuAndItemSelectors");
      return AdaptiveWebMenus.fromGenericMenuAndItemSelectors(<Selector> selector1, selector2);
    }

    // Case 3: called with three arguments
    // They must resp. be a generic menu selector, a generic group selector, and a generic item selector
    // console.log("fromGenericMenuGroupAndItemSelectors");
    return AdaptiveWebMenus.fromGenericMenuGroupAndItemSelectors(<Selector> selector1, selector2, selector3);
  }

  // Create an AWM instance from standard AWM classes selectors
  // The related classes are defined as static properties of related AdaptiveElements
  static fromAWMClasses (): AdaptiveWebMenus {
    let menuSelector = "." + Menu.AWM_CLASS;
    let groupSelector = "." + ItemGroup.AWM_CLASS;
    let itemSelector = "." + Item.AWM_CLASS;

    return AdaptiveWebMenus.fromGenericMenuGroupAndItemSelectors(menuSelector, groupSelector, itemSelector);
  }
}
