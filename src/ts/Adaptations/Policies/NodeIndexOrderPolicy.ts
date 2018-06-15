import { ItemListPolicy } from "./ItemListPolicy";
import { ItemGroupListPolicy } from "./ItemGroupListPolicy";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Item } from "../../Elements/Item";
import { ItemGroup } from "../../Elements/ItemGroup";


export class NodeIndexOrderPolicy implements ItemListPolicy, ItemGroupListPolicy {

  constructor () { }


  getItemGroupList (menus: Menu[], analyser?: DataAnalyser): ItemGroup[] {
    return Menu.getAllMenusGroups(menus)
      .sort((group1, group2) => {
        return group1.node.index() - group2.node.index();
      });
  }

  getItemList (menus: Menu[], analyser?: DataAnalyser): Item[] {
    return Menu.getAllMenusItems(menus)
      .sort((item1, item2) => {
        return item1.node.index() - item2.node.index();
      });
  }
}
