import { AdaptationPolicy } from "../Adaptation";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Menu } from "../../Elements/Menu";
import { ItemGroup } from "../../Elements/ItemGroup";


export interface ItemGroupListPolicy extends AdaptationPolicy {

  // Any class implementing this interface must implement this function
  // It should return a list of item groups (from the given menus),
  // possibly sorted or filtered according to a particular policy
  getItemGroupList (menus: Menu[], analyser?: DataAnalyser): ItemGroup[];
}
