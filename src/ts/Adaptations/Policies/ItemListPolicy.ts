import { AdaptationPolicy } from "../Adaptation";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Menu } from "../../Elements/Menu";
import { Item } from "../../Elements/Item";


export interface ItemListPolicy extends AdaptationPolicy {

  // Any class implementing this interface must implement this function
  // It should return a list of items (from the given menus),
  // possibly sorted or filtered according to a particular policy
  getItemList (menus: Menu[], analyser?: DataAnalyser): Item[];
}
