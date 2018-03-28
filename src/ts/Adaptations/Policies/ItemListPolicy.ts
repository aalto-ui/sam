import { AdaptationPolicy } from "../Adaptation";
import { DataAnalyser } from "../../UserData/DataAnalyser";
import { Menu } from "../../Menus/Menu";
import { Item } from "../../Menus/Item";


export interface ItemListPolicy extends AdaptationPolicy {

  // Any class implementing this interface must implement this function
  // It should return a list of items (from the given menus),
  // possibly sorted or filtered according to a particular policy
  getItemList (menus: Menu[], analyser?: DataAnalyser): Item[];
}
