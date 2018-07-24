import { MenuManager, MenuSelectors } from "./elements/MenuManager";
import { Menu } from "./elements/Menu";
import { ItemGroup } from "./elements/ItemGroup";
import { Item } from "./elements/Item";
import { DataManager } from "./data/DataManager";
import { AdaptationManager } from "./adaptations/AdaptationManager";
import { DebugDisplay } from "./DebugDisplay";
import { Selector } from "./elements/AdaptiveElement";


export class AdaptiveWebMenus {
  // Adaptive menu manager
  private readonly menuManager: MenuManager;

  // Data manager
  private readonly dataManager: DataManager;

  // Adaptation manager
  readonly adaptationManager: AdaptationManager;

  // Debug display
  private readonly debugDisplay: DebugDisplay;

  constructor (menuManager: MenuManager, debug: boolean = true) {
    this.menuManager = menuManager;

    this.dataManager = new DataManager(this.menuManager);

    this.adaptationManager = new AdaptationManager(this.menuManager, this.dataManager);
    this.adaptationManager.applyCurrentAdaptation();

    this.debugDisplay = new DebugDisplay(this, debug);
  }

  clearHistory () {
    this.dataManager.database.empty();

    this.adaptationManager.resetCurrentAdaptation();
    this.adaptationManager.applyCurrentAdaptation();
  }

  // Add a menu to the list of menus to adapt
  // The adaptation is automatically updated to take the addition into account
  addMenu (menu: Menu) {
    this.adaptationManager.resetCurrentAdaptation();

    this.menuManager.addMenu(menu);

    // Update the data logger to consider the new menu
    this.dataManager.logger.startListeningForMenuItemClicks(menu);

    this.adaptationManager.applyCurrentAdaptation();
  }

  // Remove the menu with the given menu ID from the list of menus to adapt
  // The adaptation is automatically updated to take the removal into account
  // If no menu is found with the given ID, nothing happens
  removeMenu (menuID: string) {
    this.adaptationManager.resetCurrentAdaptation();

    let removedMenu = this.menuManager.removeMenu(menuID);

    // Update the data logger to ignore the removed menu
    if (removedMenu !== null) {
      this.dataManager.logger.stopListeningForMenuItemClicks(removedMenu[0]);
    }

    this.adaptationManager.applyCurrentAdaptation();
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
      let menuManager = MenuManager.fromSpecificSelectors(selector1 as MenuSelectors);
      return new AdaptiveWebMenus(menuManager);
    }

    // Case 2: called with two arguments
    // They must resp. be a generic menu selector and a generic item selector
    else if (selector3 === undefined) {
      // console.log("fromGenericMenuAndItemSelectors");
      let menuManager = MenuManager.fromGenericMenuAndItemSelectors(selector1 as Selector, selector2);
      return new AdaptiveWebMenus(menuManager);
    }

    // Case 3: called with three arguments
    // They must resp. be a generic menu selector, a generic group selector, and a generic item selector
    else {
      let menuManager = MenuManager.fromGenericMenuGroupAndItemSelectors(selector1 as Selector, selector2, selector3);
      return new AdaptiveWebMenus(menuManager);
    }
  }

  // Create an AWM instance from standard AWM classes selectors
  // The related classes are defined as static properties of related AdaptiveElements
  static fromAWMClasses (): AdaptiveWebMenus {
    let menuSelector = "." + Menu.AWM_CLASS;
    let groupSelector = "." + ItemGroup.AWM_CLASS;
    let itemSelector = "." + Item.AWM_CLASS;

    let menuManager = MenuManager.fromGenericMenuGroupAndItemSelectors(menuSelector, groupSelector, itemSelector);
    return new AdaptiveWebMenus(menuManager);
  }
}
