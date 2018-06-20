import { ItemListPolicy, ItemWithScore } from "./ItemListPolicy";
import { ItemGroupListPolicy, ItemGroupWithScore } from "./ItemGroupListPolicy";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";


export class NodeIndexOrderPolicy implements ItemListPolicy, ItemGroupListPolicy {

  constructor () { }


  getSortedItemsWithScores (menus: Menu[], analyser?: DataAnalyser): ItemWithScore[] {
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

  getSortedItemGroupsWithScores (menus: Menu[], analyser?: DataAnalyser): ItemGroupWithScore[] {
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
