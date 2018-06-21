import * as $ from "jquery";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Policy } from "../Policies/Policy";
import { Technique } from "./Technique";


// This technique is doing nothing (no change to the page)
// Its only purpose is to be available (with the right type) as a baseline
export class Identity implements Technique<Policy> {

  readonly name: string = "Identity";

  reset () {
    // Nothing to do
  }

  apply (menus: Menu[]) {
    // Nothing to do
  }
}
