import { AdaptationPolicy } from "../Adaptation";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Menu } from "../../Elements/Menu";
import { Item } from "../../Elements/Item";


export interface ItemWithScore {
  item: Item;
  score: number;
}


export interface ItemListPolicy extends AdaptationPolicy {

  // Any class implementing this interface must implement this function
  // It should return a sorted array of items with their scores (from the given menus)
  getSortedItemsWithScores (menus: Menu[], analyser?: DataAnalyser): ItemWithScore[];
}
