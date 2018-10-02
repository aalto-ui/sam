import { MenuManager } from "../../elements/MenuManager";
import { Policy } from "../policies/Policy";
import { DataManager } from "../../data/DataManager";


/**
 * Interface of an adaptation technique, i.e. specifying _how_ to adapt a menu.
 * All adaptation technique classes must implement this interface.
 */
export interface Technique {

  /**
   * Name of the adaptation technique.
   * It must be unique among all techniques.
   */
  readonly name: string;

  /**
   * Remove all effects of the adaptation from the menus.
   *
   * This method must restore the adapted menus into their original states,
   * as if they had not been adapted.
   */
  reset (): void;

  /**
   * Apply the adaptation to the the menus of the given menu manager,
   * using the given policy and data.
   *
   * @param menuManager The menu manager containing the menus to adapt.
   * @param policy      The adaptation policy to use to compute scores.
   * @param dataManager The data manager containing data for the policy.
   */
  apply (menuManager: MenuManager, policy?: Policy, dataManager?: DataManager): void;
}
