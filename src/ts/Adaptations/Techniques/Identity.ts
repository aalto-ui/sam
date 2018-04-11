import * as $ from "jquery";
import { AdaptationTechnique, AdaptationPolicy } from "../Adaptation";
import { Menu } from "../../Menus/Menu";
import { DataAnalyser } from "../../UserData/DataAnalyser";


// This technique is doing nothing (no change to the page)
// Its only purpose is to be available (with the right type) as a baseline
export class Identity implements AdaptationTechnique {

  reset () {
    // Nothing to do
  }

  apply (menus: Menu[], policy?: AdaptationPolicy, analyser?: DataAnalyser) {
    // Nothing to do
  }
}
