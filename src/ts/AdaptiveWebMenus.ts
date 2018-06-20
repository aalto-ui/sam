import * as $ from "jquery";

import { Menu } from "./Elements/Menu";
import { ItemGroup } from "./Elements/ItemGroup";
import { Item } from "./Elements/Item";
import { Database } from "./Data/Database";
import { DataLogger } from "./Data/DataLogger";
import { DataAnalyser } from "./Data/DataAnalyser";
import { Adaptation } from "./Adaptations/Adaptation";
import { DebugDisplay } from "./DebugDisplay";
import { Selector, isSelector } from "./Elements/AdaptiveElement";

import { Identity } from "./Adaptations/Techniques/Identity";
import { Highlight } from "./Adaptations/Techniques/Highlight";
import { ReorderItems } from "./Adaptations/Techniques/ReorderItems";
import { HighlightAndReorderItems } from "./Adaptations/Techniques/HighlightAndReorderItems";
import { Fold } from "./Adaptations/Techniques/Fold";
import { ReorderItemsAndFold } from "./Adaptations/Techniques/ReorderItemsAndFold";
import { HighlightReorderItemsAndFold } from "./Adaptations/Techniques/HighlightReorderItemsAndFold";
import { ReorderGroups } from "./Adaptations/Techniques/ReorderGroups";
import { HighlightAndReorderAll } from "./Adaptations/Techniques/HighlightAndReorderAll";

import { MostClickedItemListPolicy } from "./Adaptations/Policies/MostClickedItemsPolicy";
import { MostVisitedPagesPolicy } from "./Adaptations/Policies/MostVisitedPagesPolicy";
import { LongestVisitDurationPolicy } from "./Adaptations/Policies/LongestVisitDurationPolicy";
import { MostRecentVisitsPolicy } from "./Adaptations/Policies/MostRecentVisitsPolicy";
import { SerialPositionCurvePolicy } from "./Adaptations/Policies/SerialPositionCurvePolicy";
import { AccessRankPolicy } from "./Adaptations/Policies/AccessRankPolicy";




// Type alias used for convenience
// It represents an object who keys are menu selectors, and values are either
// generic item selectors, or specific group-items selector objects
export type MenuSelectors = {
  [key: string]: Selector | {[key: string]: Selector}
};


export class AdaptiveWebMenus {
  // List of adaptive menus
  private readonly menus: Menu[];

  // Databse, logger and analyser
  private readonly database: Database;
  private readonly dataLogger: DataLogger;
  private readonly dataAnalyser: DataAnalyser;

  // Debug display
  private readonly debugDisplay: DebugDisplay;

  // Describe and init all available adaptations
  readonly adaptations: {[key: string]: Adaptation} = {
    "None": {
      technique: new Identity(),
      policies: {},
      selectedPolicy: null
    },

    "Highlighting": {
      technique: new Highlight(),
      policies: {
        "Most clicked items policy": new MostClickedItemListPolicy(),
        "Most visited pages policy": new MostVisitedPagesPolicy(),
        "Longest visit duration policy": new LongestVisitDurationPolicy(),
        "Most recent visits policy": new MostRecentVisitsPolicy(),
        "Serial-Position curve policy": new SerialPositionCurvePolicy(),
        "AccessRank policy": new AccessRankPolicy()
      },
      selectedPolicy: null
    },

    "Reordering": {
      technique: new ReorderItems(),
      policies: {
        "Most clicked items policy": new MostClickedItemListPolicy(),
        "Most visited pages policy": new MostVisitedPagesPolicy(),
        "Longest visit duration policy": new LongestVisitDurationPolicy(),
        "Most recent visits policy": new MostRecentVisitsPolicy(),
        "Serial-Position curve policy": new SerialPositionCurvePolicy(),
        "AccessRank policy": new AccessRankPolicy()
      },
      selectedPolicy: null
    },

    "Highlighting + reordering": {
      technique: new HighlightAndReorderItems(),
      policies: {
        "Most clicked items policy": new MostClickedItemListPolicy(),
        "Most visited pages policy": new MostVisitedPagesPolicy(),
        "Longest visit duration policy": new LongestVisitDurationPolicy(),
        "Most recent visits policy": new MostRecentVisitsPolicy(),
        "Serial-Position curve policy": new SerialPositionCurvePolicy(),
        "AccessRank policy": new AccessRankPolicy()
      },
      selectedPolicy: null
    },

    "Folding": {
      technique: new Fold(),
      policies: {
        "Most clicked items policy": new MostClickedItemListPolicy(),
        "Most visited pages policy": new MostVisitedPagesPolicy(),
        "Longest visit duration policy": new LongestVisitDurationPolicy(),
        "Most recent visits policy": new MostRecentVisitsPolicy(),
        "Serial-Position curve policy": new SerialPositionCurvePolicy(),
        "AccessRank policy": new AccessRankPolicy()
      },
      selectedPolicy: null
    },

    "Reordering + folding": {
      technique: new ReorderItemsAndFold(),
      policies: {
        "Most clicked items policy": new MostClickedItemListPolicy(),
        "Most visited pages policy": new MostVisitedPagesPolicy(),
        "Longest visit duration policy": new LongestVisitDurationPolicy(),
        "Most recent visits policy": new MostRecentVisitsPolicy(),
        "Serial-Position curve policy": new SerialPositionCurvePolicy(),
        "AccessRank policy": new AccessRankPolicy()
      },
      selectedPolicy: null
    },

    "Highlighting + reordering + folding": {
      technique: new HighlightReorderItemsAndFold(),
      policies: {
        "Most clicked items policy": new MostClickedItemListPolicy(),
        "Most visited pages policy": new MostVisitedPagesPolicy(),
        "Longest visit duration policy": new LongestVisitDurationPolicy(),
        "Most recent visits policy": new MostRecentVisitsPolicy(),
        "Serial-Position curve policy": new SerialPositionCurvePolicy(),
        "AccessRank policy": new AccessRankPolicy()
      },
      selectedPolicy: null
    },

    "Group reordering": {
      technique: new ReorderGroups(),
      policies: {
        "Most clicked items policy": new MostClickedItemListPolicy(),
        "Most visited pages policy": new MostVisitedPagesPolicy(),
        "Longest visit duration policy": new LongestVisitDurationPolicy(),
        "Most recent visits policy": new MostRecentVisitsPolicy(),
        "Serial-Position curve policy": new SerialPositionCurvePolicy(),
        "AccessRank policy": new AccessRankPolicy()
      },
      selectedPolicy: null
    },

    "Highlighting + group & item reordering": {
      technique: new HighlightAndReorderAll(),
      policies: {
        "Most clicked items policy": new MostClickedItemListPolicy(),
        "Most visited pages policy": new MostVisitedPagesPolicy(),
        "Longest visit duration policy": new LongestVisitDurationPolicy(),
        "Most recent visits policy": new MostRecentVisitsPolicy(),
        "Serial-Position curve policy": new SerialPositionCurvePolicy(),
        "AccessRank policy": new AccessRankPolicy()
      },
      selectedPolicy: null
    },
  };

  private currentAdaptationTechniqueName: string;
  private currentAdaptationPolicyName: string | null;

  private currentAdaptation: Adaptation;


  constructor (menus: Menu[] = [], debug: boolean = true) {
    this.menus = menus;

    this.database = new Database();
    this.dataLogger = new DataLogger(this.database, menus);
    this.dataAnalyser = new DataAnalyser(this.database);

    // DEBUG
    console.log("ITEM CLICK ANALYSIS", this.dataAnalyser.getItemClickAnalysis());
    console.log("PAGE VISITS ANALYSIS", this.dataAnalyser.getPageVisitsAnalysis());

    // Set up the adaptation (previously saved or default), and apply it
    this.loadAdaptationFromDatabase();
    this.applyAdaptation();

    this.debugDisplay = new DebugDisplay(this, debug);
  }

  private setAdaptationTechnique (techniqueName: string) {
    if (! (techniqueName in this.adaptations)) {
      console.error(`setAdaptationTechnique failed: technique name (${techniqueName}) not found`);
      return;
    }

    // Internal technique update
    this.currentAdaptation = this.adaptations[techniqueName];
    this.currentAdaptationTechniqueName = techniqueName;

    // Database persistent state update
    this.database.persistentLibraryState.techniqueName = techniqueName;
  }

  private setAdaptationPolicy (policyName: string | null) {
    if (policyName === null) {
      this.currentAdaptation.selectedPolicy = null;
      this.currentAdaptationPolicyName = null;

      return;
    }

    if (! (policyName in this.currentAdaptation.policies)) {
      console.error(`setAdaptationPolicy failed: policy name (${policyName}) not found`);
      return;
    }

    // Internal policy update
    this.currentAdaptation.selectedPolicy = this.currentAdaptation.policies[policyName];
    this.currentAdaptationPolicyName = policyName;

    // Database persistent state update
    this.database.persistentLibraryState.policyName = policyName;
  }

  private setAdaptation (techniqueName: string, policyName: string | null) {
    this.setAdaptationTechnique(techniqueName);
    this.setAdaptationPolicy(policyName);
  }

  private setDefaultAdaptation () {
    this.setAdaptation("Highlighting", "Most clicked items policy");
  }

  // Load the adaptation state from the database
  // If any piece of data is missing, fall back to the default values (see setDefaultAdaptation)
  private loadAdaptationFromDatabase () {
    let techniqueName = this.database.persistentLibraryState.techniqueName;
    let policyName = this.database.persistentLibraryState.policyName;

    if (techniqueName === undefined || policyName === undefined) {
      this.setDefaultAdaptation();
      return;
    }

    // `null` is encoded as an empty string in the local storage
    // If any name is one, it must be set back to null instead
    techniqueName = techniqueName === "" ? null : techniqueName;
    policyName = policyName === "" ? null : policyName;

    this.setAdaptation(techniqueName, policyName);
  }

  private applyAdaptation () {
    if (! this.currentAdaptation) {
      return;
    }

    this.currentAdaptation.technique.apply(this.menus, this.currentAdaptation.selectedPolicy, this.dataAnalyser);
  }

  private resetAdaptation () {
    if (! this.currentAdaptation) {
      return;
    }

    this.currentAdaptation.technique.reset();
  }

  // Switch the adaptation technique, using the optionnally specified policy
  // If no policy is specified, use the first one in the list of related policies
  // If any given name is not found, nothing happens
  switchToTechnique (techniqueName: string, policyName?: string | null) {
    // In case no policy name was specified, fetch one (if none, set it to null)
    if (policyName === undefined) {
      let availablePolicyNames = Object.keys(this.adaptations[techniqueName].policies);
      if (availablePolicyNames.length > 0) {
        policyName = availablePolicyNames[0];
      }
      else {
        policyName = null;
      }
    }

    this.resetAdaptation();
    this.setAdaptation(techniqueName, policyName);
    this.applyAdaptation();

    console.log("New technique:", this.currentAdaptationTechniqueName);
    console.log("New policy:", this.currentAdaptationPolicyName);
  }

  // Switch the adaptation policy of the current adaptation technique
  // If there is no adaptation, or if the given name is not found, nothing happens
  switchToPolicy (policyName: string | null) {
    this.resetAdaptation();
    this.setAdaptationPolicy(policyName);
    this.applyAdaptation();

    console.log("New technique:", this.currentAdaptationTechniqueName);
    console.log("New policy:", this.currentAdaptationPolicyName);
  }

  // Cancel the current adaptation, if any, by resetting any changes it has made
  cancelAdaptation () {
    this.resetAdaptation();
    this.currentAdaptation = null;

    console.log("Canceled adaptation");
  }

  getCurrentTechniqueName () {
    return this.currentAdaptationTechniqueName
  }

  getCurrentPolicyName () {
    return this.currentAdaptationPolicyName
  }

  getAllAdaptationTechniqueNames (): string[] {
    return [...Object.keys(this.adaptations)];
  }

  getAllAdaptationPoliciesNames (techniqueName: string): string[] {
    return [...Object.keys(this.adaptations[techniqueName].policies)];
  }

  getAllCurrentTechniquePolicyNames () {
    return this.getAllAdaptationPoliciesNames(this.currentAdaptationTechniqueName);
  }

  clearHistory () {
    this.database.empty();

    this.resetAdaptation();
    this.applyAdaptation();
  }

  // Add a menu to the list of menus to adapt
  // The adaptation is automatically updated to take the addition into account
  addMenu (menu: Menu) {
    this.resetAdaptation();

    this.menus.push(menu);

    // Update the data logger to consider the new menu
    this.dataLogger.startListeningForMenuItemClicks(menu);

    this.applyAdaptation();
  }

  // Remove the menu with the given menu ID from the list of menus to adapt
  // The adaptation is automatically updated to take the removal into account
  // If no menu is found with the given ID, nothing happens
  removeMenu (menuID: string) {
    this.resetAdaptation();

    let removalIndex = this.menus.findIndex((menu) => {
      return menu.id === menuID;
    });

    if (removalIndex === -1) {
      return;
    }

    let removedMenu = this.menus.splice(removalIndex, 1);

    // Update the data logger to ignore the removed menu
    this.dataLogger.stopListeningForMenuItemClicks(removedMenu[0]);

    this.applyAdaptation();
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
