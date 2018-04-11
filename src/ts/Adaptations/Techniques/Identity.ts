import * as $ from "jquery";
import { AdaptationTechnique, AdaptationPolicy } from "../Adaptation";
import { Menu } from "../../Menus/Menu";
import { DataAnalyser } from "../../UserData/DataAnalyser";


// This technique is doing nothing (no change to the page)
// Its only purpose is to be available (with the right type) as a baseline
export class Identity extends AdaptationTechnique {

  static reset () {

  }

  static apply (menus: Menu[], policy?: AdaptationPolicy, analyser?: DataAnalyser) {

  }
}
