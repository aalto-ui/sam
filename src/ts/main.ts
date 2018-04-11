import * as $ from "jquery";
import { Menu } from "./Menus/Menu";
import { AdaptiveWebMenus } from "./awm";


$(document).ready(function () {
  // DEBUG: setup for page<1-6>.html
  let mainMenu = Menu.fromSelectors("#main-menu", {".menu-group": "li"});

  let menus = [mainMenu];
  console.log("Menu", menus);

  let awm = new AdaptiveWebMenus(menus);
  console.log("AWM library initialised");


  // DEBUG
  window["awm"] = awm;
});
