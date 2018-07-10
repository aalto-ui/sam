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

  // TODO: move this to Reorder parent class? make it more abstract/generic?
  private saveGroupsInOriginalOrder (menus: Menu[]) {
    let groups = Menu.getAllMenusGroups(menus);

    for (let group of groups) {
      let parentElement = group.node.parent()[0];

      if (! this.childrenInOriginalOrder.has(parentElement)) {
        this.childrenInOriginalOrder.set(parentElement, $(parentElement).children());
      }
    }
  }

  apply (menus: Menu[], policy: Policy, analyser?: DataAnalyser) {
    this.saveGroupsInOriginalOrder(menus);

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
