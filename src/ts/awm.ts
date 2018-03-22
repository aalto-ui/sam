import * as $ from "jquery";
import { Menu } from "./Menus/Menu";

$(document).ready(function () {
  console.log("AWM library initialised");

  let menus = [];
  menus.push(Menu.fromSelectors("#awm-main-menu", ".menu-group", "li"));
  menus.push(Menu.fromSelectors("#awm-other-menu", "#awm-other-menu", "li"));
});
