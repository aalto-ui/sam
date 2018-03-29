import * as $ from "jquery";
import { Menu } from "./Menus/Menu";
import { DataLogger } from "./UserData/DataLogger";
import { Database } from "./UserData/Database";
import { DataAnalyser } from "./UserData/DataAnalyser";
import { MostClickedItemListPolicy } from "./Adaptations/Policies/MostClickedItemsPolicy";
import { Highlight } from "./Adaptations/Highlighting/Highlight";
import { MostVisitedPagesPolicy } from "./Adaptations/Policies/MostVisitedPagesPolicy";

// For debug purposes: reset the log database
let debug_db = null;
window["emptyDatabase"] = function emptyDatabase () {
  debug_db.data = null;
  localStorage.clear();
}

$(document).ready(function () {
  console.log("AWM library initialised");

  // DEBUG: setup for example.html
  //let menus = [];
  //menus.push(Menu.fromSelectors("#awm-main-menu", ".menu-group", "li"));
  //menus.push(Menu.fromSelectors("#awm-other-menu", "#awm-other-menu", "li"));
  //console.log("MENUS", menus);

  // DEBUG: setup for page<1-6>.html
  // TODO: make a simpler init for lists of links, e.g. automatically using :eq(pos)
  let mainMenu = Menu.fromSelectors("#main-menu", {
    ".menu-group": [0,1,2,3,4,5].map(i => { return `li:eq(${i}) > a`})
  });

  let menus = [mainMenu];
  console.log("Menu", menus);

  let db = new Database();
  debug_db = db; // debug
  let logger = new DataLogger(db, menus);
  let analyser = new DataAnalyser(db);

  console.log("ITEM CLICK ANALYSIS", analyser.analyseItemClicks());
  console.log("PAGE VISITS ANALYSIS", analyser.analysePageVisits());

  // let policy = new MostClickedItemListPolicy();
  let policy = new MostVisitedLinksPolicy();
  let adaptation = Highlight;

  adaptation.apply(menus, policy, analyser);
});
