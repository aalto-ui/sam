import { Reorder } from "./Reorder";
import { Menu } from "../../elements/Menu";
import { DataAnalyser } from "../../data/DataAnalyser";
import { ItemGroup } from "../../elements/ItemGroup";
import { Policy } from "../Policies/Policy";


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

  private getFilteredSortedGroups (menus: Menu[], policy: Policy, analyser: DataAnalyser): ItemGroup[] {
    return policy.getSortedItemGroupsWithScores(menus, analyser)
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

  apply (menus: Menu[], policy: Policy, analyser?: DataAnalyser) {
    let groups = this.getFilteredSortedGroups(menus, policy, analyser);

    // Save some children in their original order to be able to reset the reordering
    this.saveParentNodeChildrenInOriginalOrder(groups);

    this.reorderAllElements(groups);
  }
}
