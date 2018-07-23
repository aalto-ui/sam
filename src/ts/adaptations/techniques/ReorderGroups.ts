import { Reorder } from "./Reorder";
import { Menu } from "../../elements/Menu";
import { DataManager } from "../../data/DataManager";
import { ItemGroup } from "../../elements/ItemGroup";
import { Policy } from "../policies/Policy";


export class ReorderGroups extends Reorder {

  protected static readonly REORDERED_ELEMENT_CLASS: string = "awm-reordered-group";

  readonly name: string = "Reorder groups";


  constructor () {
    super();
  }

  protected getReorderedElementClass (): string {
    return "awm-reordered-group";
  }

  protected getReorderedElementType (): string {
    return ItemGroup.ELEMENT_TYPE;
  }

  private getFilteredSortedGroups (menus: Menu[], policy: Policy, dataManager?: DataManager): ItemGroup[] {
    return policy.getSortedItemGroupsWithScores(menus, dataManager)
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

  apply (menus: Menu[], policy: Policy, dataManager?: DataManager) {
    let groups = this.getFilteredSortedGroups(menus, policy, dataManager);

    // Save some children in their original order to be able to reset the reordering
    this.saveParentNodeChildrenInOriginalOrder(groups);

    this.reorderAllElements(groups);
  }
}
