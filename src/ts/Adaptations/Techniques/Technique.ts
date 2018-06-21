import { Menu } from "../../Elements/Menu";
import { Policy } from "../Policies/Policy";
import { DataAnalyser } from "../../Data/DataAnalyser";


// Interface of a menu adaptation
// Any adaptation technique must implement this interface
export interface Technique {
  // Reset the page menus, by removing any changes made by this adaptation
  reset (): void;

  // Adapt the page menus, using the given data analyser if required
  apply (menus: Menu[], policy?: Policy, analyser?: DataAnalyser): void;
}
