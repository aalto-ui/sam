/** @module adaptation */

import { DefaultTargetPolicy } from './DefaultTargetPolicy';
import { MenuManager } from "../../elements/MenuManager";
import { ItemWithScore, ItemGroupWithScore } from "./TargetPolicy";


export class NodeIndexOrderPolicy extends DefaultTargetPolicy {

  // ============================================================ PROPERTIES ===

  readonly name: string = "Node index order";


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of NodeIndexOrderPolicy.
   */
  constructor () {
    super();
  }


  // =============================================================== METHODS ===

  getSortedItemsWithScores (menuManager: MenuManager): ItemWithScore[] {
    let items = menuManager.getAllItems();
    let uniformScore = 1 / items.length;

    return items
      .sort((item1, item2) => {
        return item1.node.index() - item2.node.index();
      })
      .map((item) => {
        return {
          item: item,
          score: uniformScore
        };
      });
  }

  getSortedItemGroupsWithScores (menuManager: MenuManager): ItemGroupWithScore[] {
    let groups = menuManager.getAllGroups();
    let uniformScore = 1 / groups.length;

    return groups
      .sort((group1, group2) => {
        return group1.node.index() - group2.node.index();
      })
      .map((group) => {
        return {
          group: group,
          score: uniformScore
        };
      });
  }
}
