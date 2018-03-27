import * as $ from "jquery";
import { Menu } from "./Menus/Menu";
import { DataLogger } from "./UserData/DataLogger";
import { Database } from "./UserData/Database";
import { DataAnalyser } from "./UserData/DataAnalyser";
import { HighlightMostClickedItems } from "./Adaptations/Highlighting/HighlightMostClickedItems";

$(document).ready(function () {
  console.log("AWM library initialised");

  let menus = [];
  menus.push(Menu.fromSelectors("#awm-main-menu", ".menu-group", "li"));
  menus.push(Menu.fromSelectors("#awm-other-menu", "#awm-other-menu", "li"));
  console.log("MENUS", menus);

  let db = new Database();
  let logger = new DataLogger(db);
  let analyser = new DataAnalyser(db);

  console.log("ITEM CLICK ANALYSIS", analyser.analyseItemClicks());
  console.log("PAGE VISITS ANALYSIS", analyser.analysePageVisits());

  HighlightMostClickedItems.apply(analyser);
});
