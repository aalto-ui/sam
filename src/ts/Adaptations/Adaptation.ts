import { Menu } from "../Elements/Menu";
import { DataAnalyser } from "../Data/DataAnalyser";


// Interface of an adaptation policy
// Any policy should implement this interface
export interface AdaptationPolicy { };


// Interface of a menu adaptation
// Any adaptation technique should implement this interface
export interface AdaptationTechnique {
  // Reset the page menus, by removing any changes made by this adaptation
  reset (): void;

  // Adapt the page menus, using the given data analyser if required
  // This method must be implemented appropriately by any concrete child class!
  apply (menus: Menu[], policy?: AdaptationPolicy, analyser?: DataAnalyser): void;
}


// Interface representing a complete adaptation,
// i.e. a technique coupled with all the available adaptations
export interface Adaptation {
  technique: AdaptationTechnique;
  policies: {[key: string]: AdaptationPolicy};

  // Currently selected policy: it must refer to any item of the policies field, or null
  selectedPolicy: AdaptationPolicy | null;
}
