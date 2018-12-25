import { MenuManager } from "../elements/MenuManager";
import { DataManager } from "../data/DataManager";
import { AdaptationStyle } from "./styles/AdaptationStyle";
import { TargetPolicy } from "./policies/TargetPolicy";

import { Highlight } from "./styles/Highlight";
import { Identity } from "./styles/Identity";
import { ReorderItems } from "./styles/ReorderItems";
import { HighlightAndReorderItems } from "./styles/composites/HighlightAndReorderItems";
import { Fold } from "./styles/Fold";
import { ReorderItemsAndFold } from "./styles/composites/ReorderItemsAndFold";
import { HighlightReorderItemsAndFold } from "./styles/composites/HighlightReorderItemsAndFold";
import { ReorderGroups } from "./styles/ReorderGroups";
import { HighlightAndReorderAll } from "./styles/composites/HighlightAndReorderAll";
import { ProgressiveHighlightAndReorderItems } from "./styles/composites/ProgressiveHighlightAndReorderItems";

import { AccessRankPolicy } from "./policies/AccessRankPolicy";
import { LongestVisitDurationPolicy } from "./policies/LongestVisitDurationPolicy";
import { MostClickedItemListPolicy } from "./policies/MostClickedItemsPolicy";
import { MostRecentVisitsPolicy } from "./policies/MostRecentVisitsPolicy";
import { MostVisitedPagesPolicy } from "./policies/MostVisitedPagesPolicy";
import { SerialPositionCurvePolicy } from "./policies/SerialPositionCurvePolicy";


export const AVAILABLE_STYLES = [
  new Identity(),
  new Highlight(),
  new ReorderItems(),
  new HighlightAndReorderItems(),
  new Fold(),
  new ReorderItemsAndFold(),
  new HighlightReorderItemsAndFold(),
  new ReorderGroups(),
  new HighlightAndReorderAll(),
  new ProgressiveHighlightAndReorderItems()
];

export const AVAILABLE_STYLE_NAMES = AVAILABLE_STYLES.map((style) => {
  return style.name;
});

export type AvailableStyle = typeof AVAILABLE_STYLES[0];


export const AVAILABLE_POLICIES = [
  new MostClickedItemListPolicy(),
  new MostVisitedPagesPolicy(),
  new MostRecentVisitsPolicy(),
  new LongestVisitDurationPolicy(),
  new SerialPositionCurvePolicy(),
  new AccessRankPolicy()
];

export const AVAILABLE_POLICY_NAMES = AVAILABLE_POLICIES.map((policy) => {
  return policy.name;
});

export type AvailablePolicies = typeof AVAILABLE_POLICIES[0];


export class AdaptationManager {

  // ============================================================ PROPERTIES ===

  /**
   * Menu manager of the library.
   */
  private readonly menuManager: MenuManager;

  /**
   * Data manager of the library.
   */
  private readonly dataManager: DataManager;

  /**
   * Current adaptation style.
   */
  private currentStyle: AdaptationStyle;

  /**
   * Current target policy.
   */
  private currentPolicy: TargetPolicy;


  // =========================================================== CONSTRUCTOR ===

  /**
   * Creates a new instance of AdaptationManager.
   *
   * @param menuManager The menu manager containing the menus to adapt.
   * @param dataManager The data manager containing data for policies.
   */
  constructor (menuManager: MenuManager, dataManager: DataManager) {
    this.menuManager = menuManager;
    this.dataManager = dataManager;

    this.currentStyle = null;
    this.currentPolicy = null;

    this.restoreAdaptationFromDatabaseOrSetDefault();
  }


  // =============================================================== METHODS ===


  // ===========================================================================
  // Style
  // ===========================================================================

  /**
   * Return the name of the current adaptation style.
   *
   * @return The name of the current style.
   */
  getCurrentStyleName (): string {
    return this.currentStyle.name;
  }

  /**
   * Set the current adaptation style.
   * If the name does not match any style, the style is not updated.
   *
   * @param  name The name of the new style.
   */
  private setStyle (name: string) {
    // Look for a style with the given name
    let style = AVAILABLE_STYLES.find((candidateStyle) => {
      return candidateStyle.name === name;
    });

    // Update the current style if one was found
    if (style === undefined) {
      console.error(`Style with name ${name} does not exist.`);
      return;
    }

    this.currentStyle = style;
    console.log(`Style has been set to ${name}.`);

    // Save the name of the current style in the persistent storage of the database
    this.dataManager.database.persistentStorage.styleName = name;
  }

  /**
   * Set the default adaptation style.
   */
  private setDefaultStyle () {
    this.setStyle("Highlight + reorder items");
  }

  /**
   * Set the adaptation style to the last one which has been in use,
   * or to the default style if no previous style is found.
   */
  private restoreStyleFromDatabaseOrSetDefault () {
    let styleName = this.dataManager.database.persistentStorage.styleName;
    if (styleName === undefined) {
      this.setDefaultStyle();
      return;
    }

    this.setStyle(styleName);
  }

  /**
   * Cancel any existing adaptation, switch to the given adaptation style,
   * and update all adapted menus accordingly.
   *
   * @param  name The name of the new style.
   */
  switchToStyle (name: string) {
    this.resetCurrentAdaptation();
    this.setStyle(name);
    this.applyCurrentAdaptation();
  }


  // ===========================================================================
  // Policy
  // ===========================================================================


  /**
   * Return the name of the current target policy.
   *
   * @return The name of the current policy.
   */
  getCurrentPolicyName (): string {
    return this.currentPolicy.name;
  }

  /**
   * Set the current target policy.
   * If the name does not match any policy, the policy is not updated.
   *
   * @param  name The name of the new policy.
   */
  private setPolicy (name: string) {
    // Look for a policy with the given name
    let policy = AVAILABLE_POLICIES.find((candidatePolicy) => {
      return candidatePolicy.name === name;
    });

    // Update the current policy if one was found
    if (policy === undefined) {
      console.error(`Policy with name ${name} does not exist.`);
      return;
    }

    this.currentPolicy = policy;
    console.log(`Policy has been set to ${name}.`);

    // Save the name of the current policy in the persistent storage of the database
    this.dataManager.database.persistentStorage.policyName = name;
  }

  /**
   * Set the default target policy.
   */
  private setDefaultPolicy () {
    this.setPolicy("AccessRank");
  }

  /**
   * Set the target policy to the last one which has been in use,
   * or to the default policy if no previous policy is found.
   */
  private restorePolicyFromDatabaseOrSetDefault () {
    let policyName = this.dataManager.database.persistentStorage.policyName;
    if (policyName === undefined) {
      this.setDefaultPolicy();
      return;
    }

    this.setPolicy(policyName);
  }

  /**
   * Cancel any existing adaptation, switch to the given taget policy,
   * and update all adapted menus accordingly.
   *
   * @param  name The name of the new policy.
   */
  switchToPolicy (name: string) {
    this.resetCurrentAdaptation();
    this.setPolicy(name);
    this.applyCurrentAdaptation();
  }


  // ===========================================================================
  // Adaptation (style + policy)
  // ===========================================================================

  /**
   * Set the adaptation style and policy to the last ones which has been in use,
   * or to the default ones if no previous ones are found.
   */
  private restoreAdaptationFromDatabaseOrSetDefault () {
    this.restoreStyleFromDatabaseOrSetDefault();
    this.restorePolicyFromDatabaseOrSetDefault();
  }

  /**
   * Apply the current adaptation style to all menus of the menu manager,
   * using the current target policy.
   */
  applyCurrentAdaptation () {
    this.currentStyle.apply(this.menuManager, this.currentPolicy, this.dataManager);
    console.log(`Applying style ${this.currentStyle.name} with policy ${this.currentPolicy.name}.`);
  }

  /**
   * Cancel the current adaptation style on all the menus which are adapted.
   */
  resetCurrentAdaptation () {
    this.currentStyle.reset();
  }

  /**
   * Cancel any existing adaptation, switch to the given style and policy,
   * and update all adapted menus accordingly.
   *
   * @param  styleName  The name of the new style.
   * @param  policyName The name of the new policy.
   */
  switchToAdaptation (styleName: string, policyName: string) {
    this.resetCurrentAdaptation();
    this.setStyle(styleName);
    this.setPolicy(policyName);
    this.applyCurrentAdaptation();
  }
}
