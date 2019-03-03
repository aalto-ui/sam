/** @module adaptation */

import { MenuManager } from "../../elements/MenuManager";
import { TargetPolicy } from "../policies/TargetPolicy";
import { DataManager } from "../../data/DataManager";


/**
 * Interface of an adaptation style, i.e. what specifies _how_ to adapt a menu.
 * All adaptation style classes must implement this interface.
 */
export interface AdaptationStyle {

  /**
   * Name of the adaptation style.
   * It must be unique among all styles.
   */
  readonly name: string;

  /**
   * Remove all effects of the adaptation style from the menus.
   *
   * This method must restore the adapted menus into their original states,
   * as if they had not been adapted.
   */
  reset (): void;

  /**
   * Apply the adaptation to all the menus of the given menu manager,
   * using the given target policy and data.
   *
   * @param menuManager The menu manager containing the menus to adapt.
   * @param policy      The target policy to use to compute scores.
   * @param dataManager The data manager containing data for the policy.
   */
  apply (menuManager: MenuManager, policy?: TargetPolicy, dataManager?: DataManager): void;
}
