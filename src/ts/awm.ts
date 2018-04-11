import * as $ from "jquery";

import { Menu } from "./Menus/Menu";
import { Database } from "./UserData/Database";
import { DataLogger } from "./UserData/DataLogger";
import { DataAnalyser } from "./UserData/DataAnalyser";
import { StaticAdaptationTechnique, AdaptationPolicy } from "./Adaptations/Adaptation";

import { Highlight } from "./Adaptations/Techniques/Highlight";
import { Reorder } from "./Adaptations/Techniques/Reorder";

import { MostClickedItemListPolicy } from "./Adaptations/Policies/MostClickedItemsPolicy";
import { MostVisitedPagesPolicy } from "./Adaptations/Policies/MostVisitedPagesPolicy";
import { LongestVisitDurationPolicy } from "./Adaptations/Policies/LongestVisitDurationPolicy";
import { MostRecentVisitsPolicy } from "./Adaptations/Policies/MostRecentVisitsPolicy";
import { SerialPositionCurvePolicy } from "./Adaptations/Policies/SerialPositionCurvePolicy";


// Interface representing a complete adaptation technique,
// Iwill all available policies + the current one
interface Adaptation {
  technique: StaticAdaptationTechnique;
  policies: {[key: string]: AdaptationPolicy};
  selectedPolicy: AdaptationPolicy;
}


export class AdaptiveWebMenus {
  // List of adaptive menus
  private readonly menus: Menu[];

  // Databse, logger and analyser
  private readonly database: Database;
  private readonly dataLogger: DataLogger;
  private readonly dataAnalyser: DataAnalyser;

  // Describe and init all available adaptations
  readonly adaptations: {[key: string]: Adaptation} = {
    "Highlighting": {
      technique: Highlight,
      policies: {
        "Most clicked items policy": new MostClickedItemListPolicy(),
        "Most visited pages policy": new MostVisitedPagesPolicy(),
        "Longest visit duration policy": new LongestVisitDurationPolicy(),
        "Most recent visits policy": new MostRecentVisitsPolicy(),
        "Serial-Position curve policy": new SerialPositionCurvePolicy()
      },
      selectedPolicy: null
    },

    "Reordering": {
      technique: Reorder,
      policies: {
        "Most clicked items policy": new MostClickedItemListPolicy(),
        "Most visited pages policy": new MostVisitedPagesPolicy(),
        "Longest visit duration policy": new LongestVisitDurationPolicy(),
        "Most recent visits policy": new MostRecentVisitsPolicy(),
        "Serial-Position curve policy": new SerialPositionCurvePolicy()
      },
      selectedPolicy: null
    }
  };

  private currentAdaptationTechniqueName: string;
  private currentAdaptationPolicyName: string;

  private currentAdaptation: Adaptation;


  constructor (menus: Menu[] = []) {
    this.menus = menus;

    this.database = new Database();
    this.dataLogger = new DataLogger(this.database, menus);
    this.dataAnalyser = new DataAnalyser(this.database);

    // DEBUG
    console.log("ITEM CLICK ANALYSIS", this.dataAnalyser.analyseItemClicks());
    console.log("PAGE VISITS ANALYSIS", this.dataAnalyser.analysePageVisits());

    this.currentAdaptation = null;
    this.setDefaultAdaptation();
  }

  private setAdaptation (techniqueName: string, policyName: string) {
    if (! (techniqueName in this.adaptations)) {
      console.error("setAdaptation failed: technique name not found");
      return;
    }

    if (! (policyName in this.adaptations[techniqueName].policies)) {
      console.error("setAdaptation failed: policy name not found");
      return;
    }

    this.currentAdaptation = this.adaptations[techniqueName];
    this.currentAdaptationTechniqueName = techniqueName;

    this.currentAdaptationPolicyName = policyName;
    this.currentAdaptation.selectedPolicy = this.currentAdaptation.policies[policyName];
  }

  private setAdaptationPolicy (policyName: string) {
    if (! this.currentAdaptation) {
      return;
    }

    if (! (policyName in this.currentAdaptation.policies)) {
      console.error("setAdaptation failed: policy name not found");
      return;
    }

    this.currentAdaptation.selectedPolicy = this.currentAdaptation.policies[policyName];
    this.currentAdaptationPolicyName = policyName;
  }

  private setDefaultAdaptation () {
    this.setAdaptation("Highlighting", "Most clicked items policy");
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
  switchAdaptationTechnique (techniqueName: string, policyName?: string) {
    // In case no policy name is specified, fetch one
    if (! policyName) {
      let availablePolicies = this.adaptations[techniqueName].policies;
      policyName = Object.keys(availablePolicies)[0];
    }

    // If an adaptation is currently applied, cancel its effects
    this.resetAdaptation();

    // Switch to the new technique and policy
    this.setAdaptation(techniqueName, policyName);

    // Finally apply the new adaptation
    this.applyAdaptation();

    console.log("Switched adaptation to", this.currentAdaptation);
  }

  // Switch the adaptation policy of the current adaptation technique
  // If there is no adaptation, or if the given name is not found, nothing happens
  switchAdaptationPolicy (policyName: string) {
    if (! this.currentAdaptation) {
      return;
    }

    // If an adaptation is currently applied, cancel its effects
    this.resetAdaptation();

    // Switch to the new technique and policy
    this.setAdaptationPolicy(policyName);

    // Finally apply the new adaptation
    this.applyAdaptation();

    console.log("Switched adaptation policy to", this.currentAdaptation);
  }

  // Cancel the current adaptation, if any, by resetting any changes it has made
  cancelAdaptation () {
    this.resetAdaptation();
    this.currentAdaptation = null;

    console.log("Canceled adaptation");
  }

  getAllAdaptationTechniqueNames (): string[] {
    return [...Object.keys(this.adaptations)];
  }

  getAllAdaptationPoliciesNames (techniqueName: string): string[] {
    return [...Object.keys(this.adaptations[techniqueName].policies)];
  }

  clearHistory () {
    this.database.empty();

    this.resetAdaptation();
    this.applyAdaptation();
  }
}
