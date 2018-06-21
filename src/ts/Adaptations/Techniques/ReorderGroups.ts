import * as $ from "jquery";
import { Reorder } from "./Reorder";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { ItemGroup } from "../../Elements/ItemGroup";
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

  apply (menus: Menu[], policy: Policy, analyser?: DataAnalyser) {
    let groups = policy.getSortedItemGroups(menus, analyser)
      .filter(group => {
        if (! group.canBeReordered) {
          return false;
        }

        let groupStats = analyser.getItemClickAnalysis().groupStats[group.id];
        return groupStats !== undefined && groupStats.nbClicks > 0;
      });

    this.reorderAllElements(groups);
  }
}
