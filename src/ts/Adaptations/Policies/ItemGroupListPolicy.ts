import { AdaptationPolicy } from "../Adaptation";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Menu } from "../../Elements/Menu";
import { ItemGroup } from "../../Elements/ItemGroup";


export interface ItemGroupWithScore {
  group: ItemGroup;
  score: number;
}


export interface ItemGroupListPolicy extends AdaptationPolicy {

  // Any class implementing this interface must implement this function
  // It should return a sorted array of item groups with their scores (from the given menus)
  getSortedItemGroupsWithScores (menus: Menu[], analyser?: DataAnalyser): ItemGroupWithScore[];
}
