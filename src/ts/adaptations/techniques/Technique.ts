import { MenuManager } from "../../elements/MenuManager";
import { Policy } from "../policies/Policy";
import { DataManager } from "../../data/DataManager";


// Interface of a menu adaptation
// Any adaptation technique must implement this interface
export interface Technique {

  // Represents the technique name, and must be unique among all techniques
  readonly name: string;

  // Reset the page menus, by removing any changes made by this adaptation
  reset (): void;

  // Adapt the page menus, using the given data analyser and database if required
  apply (menuManager: MenuManager, policy?: Policy, dataManager?: DataManager): void;
}
