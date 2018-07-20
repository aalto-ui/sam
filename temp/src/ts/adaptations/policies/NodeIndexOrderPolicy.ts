import { Menu } from "../../elements/Menu";
import { Policy, ItemWithScore, ItemGroupWithScore } from "./Policy";


export class NodeIndexOrderPolicy extends Policy {

  readonly name: string = "Node index order";

  constructor () {
    super();
  }


  getSortedItemsWithScores (menus: Menu[]): ItemWithScore[] {
    let items = Menu.getAllMenusItems(menus)
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

  getSortedItemGroupsWithScores (menus: Menu[]): ItemGroupWithScore[] {
    let groups = Menu.getAllMenusGroups(menus);
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
