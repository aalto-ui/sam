import { Menu } from "../Menus/Menu";
import { DataAnalyser } from "../UserData/DataAnalyser";


// Generic type for an adaptation policy
// Any policy for any adaptation technique should implement this interface
export interface AdaptationPolicy { };


// Generic parent class for a menu adaptation
// Any adaptation technique should implement this interface,
// as well as static methods defined below!
export abstract class AdaptationTechnique { }

// REQUIRED STATIC METHODS for adaptationn techniques  are defined in this interface
// This workaround is required because of Typescript limits
export interface StaticAdaptationTechnique {
  new(): AdaptationTechnique;

  // Reset the page menus, by removing any changes made by this adaptation
  reset (): void;

  // Adapt the page menus, using the given data analyser if required
  // This method must be implemented appropriately by any concrete child class!
  apply (menus: Menu[], policy?: AdaptationPolicy, analyser?: DataAnalyser): void;
}
