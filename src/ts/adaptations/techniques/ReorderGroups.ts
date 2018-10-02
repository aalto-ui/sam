import { Reorder } from "./Reorder";
import { MenuManager } from "../../elements/MenuManager";
import { DataManager } from "../../data/DataManager";
import { ItemGroup } from "../../elements/ItemGroup";
import { Policy } from "../policies/Policy";


export class ReorderGroups extends Reorder {

  // ============================================================ PROPERTIES ===

  /**
   * HTML class of group elements which have been reordered.
   */
  static readonly REORDERED_ELEMENT_CLASS: string = "awm-reordered-group";

  readonly name: string = "Reorder groups";


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of ReorderGroups.
   */
  constructor () {
    super();
  }


  // =============================================================== METHODS ===


  // ===========================================================================
  // Utility
  // ===========================================================================

  protected getReorderedElementClass (): string {
    return "awm-reordered-group";
  }

  protected getReorderedElementType (): string {
    return ItemGroup.ELEMENT_TYPE;
  }


  // ===========================================================================
  // Apply technique
  // ===========================================================================

  /**
   * Use the given policy to score and sort the groups of all the menus to adapt,
   * and filter out any group which:
   * - cannot be reordered;
   * - has a null (0) score.
   *
   * @param  menuManager The menu manager containing the menus with groups to reorder.
   * @param  policy      The policy to use to score the groups.
   * @param  dataManager The data manager containing data for the policy.
   * @return             A sorted and filtered list of groups.
   */
  private getFilteredSortedGroups (menuManager: MenuManager, policy: Policy, dataManager?: DataManager): ItemGroup[] {
    return policy
      .getSortedItemGroupsWithScores(menuManager, dataManager)
      .filter((groupWithScore) => {
        if (! groupWithScore.group.canBeReordered) {
          return false;
        }

        return groupWithScore.score > 0;
      })
      .map((groupWithScore) => {
        return groupWithScore.group;
      });
  }

  apply (menuManager: MenuManager, policy: Policy, dataManager?: DataManager) {
    let groups = this.getFilteredSortedGroups(menuManager, policy, dataManager);

    // Save some children in their original order to be able to reset the reordering
    this.saveParentNodeChildrenInOriginalOrder(groups);

    this.reorderAllElements(groups);
  }
}
