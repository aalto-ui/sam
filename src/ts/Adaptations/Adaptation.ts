import { Menu } from "../Menus/Menu";
import { DataAnalyser } from "../UserData/DataAnalyser";

// Generic parent class for a menu adaptation
// Any adaptation technique should extend this interface
export abstract class Adaptation {

  // Adapt the page menus, using the given data analyser if required
  // This method must be implemented appropriately by any concrete child class!
  static apply (analyser?: DataAnalyser) { }
}
