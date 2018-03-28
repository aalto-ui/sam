import { Menu } from "../Menus/Menu";
import { DataAnalyser } from "../UserData/DataAnalyser";


// Generic type for an adaptation policy
// Any policy for any adaptation technique should implement this interface
export interface AdaptationPolicy { };


// Generic parent class for a menu adaptation
// Any adaptation technique should implement this interface
export abstract class Adaptation {

  // Adapt the page menus, using the given data analyser if required
  // This method must be implemented appropriately by any concrete child class!
  static apply (menus: Menu[], policy: AdaptationPolicy, analyser?: DataAnalyser): void { };
}
