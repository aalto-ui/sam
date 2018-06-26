import { Menu } from "../Elements/Menu";
import { Database } from "../Data/Database";
import { DataAnalyser } from "../Data/DataAnalyser";
import { Technique } from "./Techniques/Technique";
import { Policy } from "./Policies/Policy";
import { AVAILABLE_TECHNIQUES, AVAILABLE_POLICIES } from "./AvailableAdaptations";


export class AdaptationManager {

  // List of menus to adapt
  private menus: Menu[];

  // The database to save the current adaptation into
  private database: Database;

  // The database analyser to use for policies
  private analyser: DataAnalyser;

  // Current technique and policy
  private currentTechnique: Technique<Policy>;
  private currentPolicy: Policy;


  constructor (menus: Menu[], database: Database, analyser: DataAnalyser) {
    this.menus = menus;
    this.database = database;
    this.analyser = analyser;

    this.currentTechnique = null;
    this.currentPolicy = null;

    this.restoreAdaptationFromDatabaseOrSetDefault();
  }


  private setTechnique (name: string) {
    // Look for a technique with the given name
    let technique = AVAILABLE_TECHNIQUES.find((technique) => {
      return technique.name === name;
    });

    // Update the current technique if one was found
    if (technique === undefined) {
      console.error(`Technique with name ${name} does not exist.`);
      return;
    }

    this.currentTechnique = technique;
    console.log(`Technique has been set to ${name}.`);

    // Save the name of the current technique in the persistent storage of the database
    this.database.persistentStorage.techniqueName = name;
  }

  private setDefaultTechnique () {
    this.setTechnique("Highlight + reorder items");
  }

  private restoreTechniqueFromDatabaseOrSetDefault () {
    let techniqueName = this.database.persistentStorage.techniqueName;
    if (techniqueName === undefined) {
      this.setDefaultTechnique();
      return;
    }

    this.setTechnique(techniqueName);
  }

  getCurrentTechniqueName (): string {
    return this.currentTechnique.name;
  }


  private setPolicy (name: string) {
    // Look for a policy with the given name
    let policy = AVAILABLE_POLICIES.find((policy) => {
      return policy.name === name;
    });

    // Update the current policy if one was found
    if (policy === undefined) {
      console.error(`Policy with name ${name} does not exist.`);
      return;
    }

    this.currentPolicy = policy;
    console.log(`Policy has been set to ${name}.`);

    // Save the name of the current policy in the persistent storage of the database
    this.database.persistentStorage.policyName = name;
  }

  private setDefaultPolicy () {
    this.setPolicy("AccessRank");
  }

  private restorePolicyFromDatabaseOrSetDefault () {
    let policyName = this.database.persistentStorage.policyName;
    console.log("in db", policyName);
    if (policyName === undefined) {
      this.setDefaultPolicy();
      return;
    }

    this.setPolicy(policyName);
  }

  getCurrentPolicyName (): string {
    return this.currentPolicy.name;
  }


  private restoreAdaptationFromDatabaseOrSetDefault () {
    this.restoreTechniqueFromDatabaseOrSetDefault();
    this.restorePolicyFromDatabaseOrSetDefault();
  }


  applyCurrentAdaptation () {
    this.currentTechnique.apply(this.menus, this.currentPolicy, this.analyser, this.database);
    console.log(`Applying technique ${this.currentTechnique.name} with policy ${this.currentPolicy.name}.`);
  }

  resetCurrentAdaptation () {
    this.currentTechnique.reset();
  }


  switchToTechnique (name: string) {
    this.resetCurrentAdaptation();
    this.setTechnique(name);
    this.applyCurrentAdaptation();
  }

  switchToPolicy (name: string) {
    this.resetCurrentAdaptation();
    this.setPolicy(name);
    this.applyCurrentAdaptation();
  }

  switchToAdaptation (techniqueName: string, policyName: string) {
    this.resetCurrentAdaptation();
    this.setTechnique(techniqueName);
    this.setPolicy(policyName);
    this.applyCurrentAdaptation();
  }
}
