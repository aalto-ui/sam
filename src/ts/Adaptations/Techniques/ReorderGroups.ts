import * as $ from "jquery";
import { Reorder } from "./Reorder";
import { Menu } from "../../Elements/Menu";
import { ItemGroupListPolicy } from "../Policies/ItemGroupListPolicy";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { ItemGroup } from "../../Elements/ItemGroup";


export class ReorderGroups extends Reorder {
  protected static readonly REORDERED_ELEMENT_CLASS: string = "awm-reordered-group";


  constructor () {
    super();
  }

  protected getReorderedElementClass (): string {
    return "awm-reordered-group";
  }

  protected getReorderedElementType (): string {
    return ItemGroup.ELEMENT_TYPE;
  }

  apply (menus: Menu[], policy: ItemGroupListPolicy, analyser?: DataAnalyser) {
    let groups = policy.getSortedItemGroupsWithScores(menus, analyser)
      .filter((groupScore) => {
        let group = groupScore.group;

        if (! group.canBeReordered) {
          return false;
        }

        let groupStats = analyser.getItemClickAnalysis().groupStats[group.id];
        return groupStats !== undefined && groupStats.nbClicks > 0;
      })
      .map((groupScore) => {
        return groupScore.group;
      });

    this.reorderAllElements(groups);
  }
}
