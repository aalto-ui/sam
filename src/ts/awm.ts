import * as $ from "jquery";
import { Menu } from "./Menus/Menu";

$(document).ready(function () {
  console.log("AWM library initialised");

  let menu = Menu.fromSelectors("#awm-main-menu", ".menu-group", "li");
  console.log(menu);
});
