import * as $ from "jquery";
import { Menu } from "./Menus/Menu";
import { DataLogger } from "./UserData/DataLogger";
import { Database } from "./UserData/Database";

$(document).ready(function () {
  console.log("AWM library initialised");

  let menus = [];
  menus.push(Menu.fromSelectors("#awm-main-menu", ".menu-group", "li"));
  menus.push(Menu.fromSelectors("#awm-other-menu", "#awm-other-menu", "li"));
  console.log(menus);

  let logger = new DataLogger(new Database());
});
