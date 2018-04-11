import * as $ from "jquery";
import { Menu } from "./Menus/Menu";
import { AdaptiveWebMenus } from "./awm";


$(document).ready(function () {
  // DEBUG: setup for page<1-6>.html

  let menuSelectors = {
    "#main-menu": {
      ".menu-group": "li"
    }
  };


  // DEBUG: setup for en.wikipedia.org
/*
  let menuSelectors = {
    "#mw-panel": {
      "#p-navigation": "li",
      "#p-interaction": "li",
      "#p-tb": "li",
      "#p-coll-print_export": "li",
      "#p-wikibase-otherprojects": "li",
      "#p-lang": "li"
    }
  };
*/

  let awm = AdaptiveWebMenus.fromMenuSelectors(menuSelectors);
  console.log("AWM library initialised");

  // DEBUG
  window["awm"] = awm;
});
