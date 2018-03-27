import * as $ from "jquery";
import { Menu } from "./Menus/Menu";
import { DataLogger } from "./UserData/DataLogger";
import { Database } from "./UserData/Database";
import { DataAnalyser } from "./UserData/DataAnalyser";
import { HighlightMostClickedItems } from "./Adaptations/Highlighting/HighlightMostClickedItems";

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
  let mainMenu = Menu.fromSelectors("#main-menu", ".menu-group", "li > a");
  console.log("Menu", mainMenu);

  let db = new Database();
  debug_db = db; // debug
  let logger = new DataLogger(db);
  let analyser = new DataAnalyser(db);

  console.log("ITEM CLICK ANALYSIS", analyser.analyseItemClicks());
  console.log("PAGE VISITS ANALYSIS", analyser.analysePageVisits());

  HighlightMostClickedItems.apply(analyser);
});
