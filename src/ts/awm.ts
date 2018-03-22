import * as $ from "jquery";
import { Menu } from "./Menus/Menu";

$(document).ready(function () {
  console.log("AWM library initialised");
  console.log("Loading the data...");

  $.getJSON("./example_data.json", null, function (data) {
      console.log("Parsed data:");
      console.log(data);

      console.log("Building menu elements...");
      let menus = [];

      for (let menuData of data["menus"]) {
        let menu = Menu.fromServerData(menuData);
        menus.push(menu);
      }

      console.log(menus);
    })
    .fail(function (error) {
      console.error("Unable to load the example JSON data:");
      console.log(error);
    });
});
