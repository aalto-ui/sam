import { MenuManager } from "../elements/MenuManager";
import { DataManager } from "../data/DataManager";
import { Technique } from "./techniques/Technique";
import { Policy } from "./policies/Policy";

import { Highlight } from "./techniques/Highlight";
import { Identity } from "./techniques/Identity";
import { ReorderItems } from "./techniques/ReorderItems";
import { HighlightAndReorderItems } from "./techniques/composites/HighlightAndReorderItems";
import { Fold } from "./techniques/Fold";
import { ReorderItemsAndFold } from "./techniques/composites/ReorderItemsAndFold";
import { HighlightReorderItemsAndFold } from "./techniques/composites/HighlightReorderItemsAndFold";
import { ReorderGroups } from "./techniques/ReorderGroups";
import { HighlightAndReorderAll } from "./techniques/composites/HighlightAndReorderAll";
import { ProgressiveHighlightAndReorderItems } from "./techniques/composites/ProgressiveHighlightAndReorderItems";

import { AccessRankPolicy } from "./policies/AccessRankPolicy";
import { LongestVisitDurationPolicy } from "./policies/LongestVisitDurationPolicy";
import { MostClickedItemListPolicy } from "./policies/MostClickedItemsPolicy";
import { MostRecentVisitsPolicy } from "./policies/MostRecentVisitsPolicy";
import { MostVisitedPagesPolicy } from "./policies/MostVisitedPagesPolicy";
import { SerialPositionCurvePolicy } from "./policies/SerialPositionCurvePolicy";


export const AVAILABLE_TECHNIQUES = [
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

export const AVAILABLE_TECHNIQUE_NAMES = AVAILABLE_TECHNIQUES.map((technique) => {
  return technique.name;
});

export type AvailableTechnique = typeof AVAILABLE_TECHNIQUES[0];


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
   * Current adaptation technique.
   */
  private currentTechnique: Technique;

  /**
   * Current adaptation policy.
   */
  private currentPolicy: Policy;


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

    this.currentTechnique = null;
    this.currentPolicy = null;

    this.restoreAdaptationFromDatabaseOrSetDefault();
  }


  // =============================================================== METHODS ===


  // ===========================================================================
  // Technique
  // ===========================================================================

  /**
   * Return the name of the current adaptation technique.
   *
   * @return The name of the current technique.
   */
  getCurrentTechniqueName (): string {
    return this.currentTechnique.name;
  }

  /**
   * Set the current adaptation technique.
   * If the name does not match any technique, the technique is not updated.
   *
   * @param  name The name of the new technique.
   */
  private setTechnique (name: string) {
    // Look for a technique with the given name
    let technique = AVAILABLE_TECHNIQUES.find((candidateTechnique) => {
      return candidateTechnique.name === name;
    });

    // Update the current technique if one was found
    if (technique === undefined) {
      console.error(`Technique with name ${name} does not exist.`);
      return;
    }

    this.currentTechnique = technique;
    console.log(`Technique has been set to ${name}.`);

    // Save the name of the current technique in the persistent storage of the database
    this.dataManager.database.persistentStorage.techniqueName = name;
  }

  /**
   * Set the default adaptation technique.
   */
  private setDefaultTechnique () {
    this.setTechnique("Highlight + reorder items");
  }

  /**
   * Set the adaptation technique to the last one which has been in use,
   * or to the default technique if no previous technique is found.
   */
  private restoreTechniqueFromDatabaseOrSetDefault () {
    let techniqueName = this.dataManager.database.persistentStorage.techniqueName;
    if (techniqueName === undefined) {
      this.setDefaultTechnique();
      return;
    }

    this.setTechnique(techniqueName);
  }

  /**
   * Cancel any existing adaptation, switch to the given adaptation technique,
   * and update all adapted menus accordingly.
   *
   * @param  name The name of the new technique.
   */
  switchToTechnique (name: string) {
    this.resetCurrentAdaptation();
    this.setTechnique(name);
    this.applyCurrentAdaptation();
  }


  // ===========================================================================
  // Policy
  // ===========================================================================


  /**
   * Return the name of the current adaptation policy.
   *
   * @return The name of the current policy.
   */
  getCurrentPolicyName (): string {
    return this.currentPolicy.name;
  }

  /**
   * Set the current adaptation policy.
   * If the name does not match any policy, the technique is not updated.
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
   * Set the default adaptation policy.
   */
  private setDefaultPolicy () {
    this.setPolicy("AccessRank");
  }

  /**
   * Set the adaptation policy to the last one which has been in use,
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
   * Cancel any existing adaptation, switch to the given adaptation policy,
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
  // Adaptation (technique + policy)
  // ===========================================================================

  /**
   * Set the adaptation technique and policy to the last ones which has been in use,
   * or to the default ones if no previous ones are found.
   */
  private restoreAdaptationFromDatabaseOrSetDefault () {
    this.restoreTechniqueFromDatabaseOrSetDefault();
    this.restorePolicyFromDatabaseOrSetDefault();
  }

  /**
   * Apply the current adaptation technique to all menus of the menu manager,
   * using the current adaptation policy.
   */
  applyCurrentAdaptation () {
    this.currentTechnique.apply(this.menuManager, this.currentPolicy, this.dataManager);
    console.log(`Applying technique ${this.currentTechnique.name} with policy ${this.currentPolicy.name}.`);
  }

  /**
   * Cancel the current adaptation technique on all the menus which are adapted.
   */
  resetCurrentAdaptation () {
    this.currentTechnique.reset();
  }

  /**
   * Cancel any existing adaptation, switch to the given couple of adaptation
   * technique and policy, and update all adapted menus accordingly.
   *
   * @param  techniqueName The name of the new technique.
   * @param  policyName    The name of the new policy.
   */
  switchToAdaptation (techniqueName: string, policyName: string) {
    this.resetCurrentAdaptation();
    this.setTechnique(techniqueName);
    this.setPolicy(policyName);
    this.applyCurrentAdaptation();
  }
}
