/** @module core */

import { MenuManager, MenuSelectors } from "./elements/MenuManager";
import { Menu, MenuID } from "./elements/Menu";
import { ItemGroup } from "./elements/ItemGroup";
import { Item } from "./elements/Item";
import { DataManager } from "./data/DataManager";
import { AdaptationManager } from "./adaptations/AdaptationManager";
import { VisualControls } from "./VisualControls";
import { Selector } from "./elements/AdaptiveElement";


export class SelfAdaptingMenus {

  // ============================================================ PROPERTIES ===

  /** Menu manager single instance of the library. */
  private readonly menuManager: MenuManager;

  /** Data manager single instance of the library. */
  private readonly dataManager: DataManager;

  /** Adaptation manager single instance of the library. */
  readonly adaptationManager: AdaptationManager;

  /** Visual controls single instance of the library. */
  private readonly visualControls: VisualControls;


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of SAM.
   * This constructor is mainly meant for internal use only:
   * for external uses, use static _builder methods_ instead.
   *
   * Note: no more than one instance should be instanciated at the same time;
   *       running more at once may result in unexpected behaviours.
   *
   * @param menuManager           The menu manager instance to use.
   * @param displayVisualControls Indicate whether to display the visual controls
   *                              or not (visible on `true`).
   */
  constructor (menuManager: MenuManager, displayVisualControls: boolean = true) {
    this.menuManager = menuManager;

    this.dataManager = new DataManager(this.menuManager);

    this.adaptationManager = new AdaptationManager(this.menuManager, this.dataManager);
    this.adaptationManager.applyCurrentAdaptation();

    this.visualControls = new VisualControls(this, displayVisualControls);
  }


  // =============================================================== METHODS ===

  /**
   * Clear all the recorded history, and update the current adaptation.
   */
  clearHistory () {
    this.dataManager.database.empty();

    this.adaptationManager.updateCurrentAdaptation();
  }


  // ===========================================================================
  // Menu addition and removal
  // ===========================================================================

  /**
   * Add a new adaptive menus, and update the current adaptation.
   *
   * @param  menu The menu to add.
   */
  addMenu (menu: Menu) {
    this.adaptationManager.cancelCurrentAdaptation();

    this.menuManager.addMenu(menu);

    // Update the data logger to consider the new menu
    this.dataManager.logger.startListeningForMenuItemClicks(menu);

    this.adaptationManager.applyCurrentAdaptation();
  }

  /**
   * Remove the adaptive menu with the given menu ID, and update the current adaptation.
   * If there is no match for the given ID, nothing happens.
   *
   * @param  id The ID of the menu to remove.
   */
  removeMenu (id: MenuID) {
    this.adaptationManager.cancelCurrentAdaptation();

    let removedMenu = this.menuManager.removeMenu(id);

    // Update the data logger to ignore the removed menu
    if (removedMenu !== null) {
      this.dataManager.logger.stopListeningForMenuItemClicks(removedMenu[0]);
    }

    this.adaptationManager.applyCurrentAdaptation();
  }


  // ======================================================== STATIC METHODS ===

  /**
   * Create a new instance of SAM from generic menu and item selectors.
   *
   * The menu node will also be the item group node.
   * Item nodes are only searched inside the menu node.
   *
   * @param  menuSelector Selector of the menu (and group) node.
   * @param  itemSelector Selector of all item nodes.
   * @return              A new instance of SAM.
   */
  static fromSelectors (menuSelector: Selector, itemSelector: Selector): SelfAdaptingMenus;

  /**
   * Create a new instance of SAM from generic menu, group and item selectors.
   *
   * The menu node must not be a group node itself
   * (see the variant of [[fromSelectors]] with two arguments instead).
   * 
   * Group nodes are only searched inside the menu node.
   * Item nodes are only searched inside the group node.
   *
   * @param  menuSelector  Selector of the menu node.
   * @param  groupSelector Selector of all group nodes.
   * @param  itemSelector  Selector of all item nodes.
   * @return               A new instance of SAM.
   */
  static fromSelectors (menuSelector: Selector, groupSelector: Selector, itemSelector: Selector): SelfAdaptingMenus;

  /**
   * Create a new instance of SAM from specific selectors.
   * See [[MenuSelectors]] for details on the expected structure of selectors.
   *
   * The menu node must not be a group node itself
   * (see the variant of [[fromSelectors]] with two arguments instead).
   * 
   * Group nodes are only searched inside the menu node.
   * Item nodes are only searched inside the group node.
   *
   * @param  selectors  Structure of selectors of menu, group and item nodes.
   * @return            A new instance of SAM.
   */
  static fromSelectors (selectors: MenuSelectors): SelfAdaptingMenus;

  static fromSelectors (selector1: Selector | MenuSelectors, selector2?: Selector, selector3?: Selector): SelfAdaptingMenus {
    // Case 1: called with one argument
    // It must be an object of specific selectors
    if (selector2 === undefined) {
      // console.log("fromSpecificSelectors");
      let menuManager = MenuManager.fromSpecificSelectors(selector1 as MenuSelectors);
      return new SelfAdaptingMenus(menuManager);
    }

    // Case 2: called with two arguments
    // They must resp. be a generic menu selector and a generic item selector
    else if (selector3 === undefined) {
      // console.log("fromGenericMenuAndItemSelectors");
      let menuManager = MenuManager.fromGenericMenuAndItemSelectors(selector1 as Selector, selector2);
      return new SelfAdaptingMenus(menuManager);
    }

    // Case 3: called with three arguments
    // They must resp. be a generic menu selector, a generic group selector, and a generic item selector
    else {
      let menuManager = MenuManager.fromGenericMenuGroupAndItemSelectors(selector1 as Selector, selector2, selector3);
      return new SelfAdaptingMenus(menuManager);
    }
  }

  /**
   * Create a new instance of SAM from standard class selectors:
   * - [[Menu.HTML_CLASS]] for menus;
   * - [[ItemGroup.HTML_CLASS]] for groups;
   * - [[Item.HTML_CLASS]] for items.
   * 
   * The menu node cannot be a group node itself (use [[fromSelectors]]).
   * Group nodes are only searched inside the menu node.
   * Item nodes are only searched inside the group node.
   *
   * @return A new instance of SAM.
   */
  static fromStandardClasses (): SelfAdaptingMenus {
    let menuSelector = "." + Menu.HTML_CLASS;
    let groupSelector = "." + ItemGroup.HTML_CLASS;
    let itemSelector = "." + Item.HTML_CLASS;

    let menuManager = MenuManager.fromGenericMenuGroupAndItemSelectors($(menuSelector), $(groupSelector), $(itemSelector));
    return new SelfAdaptingMenus(menuManager);
  }
}
