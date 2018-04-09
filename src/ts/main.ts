import * as $ from "jquery";
import { Menu } from "./Menus/Menu";
import { DataLogger } from "./UserData/DataLogger";
import { Database } from "./UserData/Database";
import { DataAnalyser } from "./UserData/DataAnalyser";
import { MostClickedItemListPolicy } from "./Adaptations/Policies/MostClickedItemsPolicy";
import { Highlight } from "./Adaptations/Techniques/Highlight";
import { Reorder } from "./Adaptations/Techniques/Reorder";
import { MostVisitedPagesPolicy } from "./Adaptations/Policies/MostVisitedPagesPolicy";
import { LongestVisitDurationPolicy } from "./Adaptations/Policies/LongestVisitDurationPolicy";
import { MostRecentVisitsPolicy } from "./Adaptations/Policies/MostRecentVisitsPolicy";
import { SerialPositionCurvePolicy } from "./Adaptations/Policies/SerialPositionCurvePolicy";

// For debug purposes: reset the log database
let db: Database = null;
window["emptyDatabase"] = function emptyDatabase () {
  db.empty();
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
    ".menu-group": [0,1,2,3,4,5].map(i => { return `li:eq(${i})`})
  });

  let menus = [mainMenu];
  console.log("Menu", menus);

  db = new Database();
  let logger = new DataLogger(db, menus);
  let analyser = new DataAnalyser(db);

  console.log("ITEM CLICK ANALYSIS", analyser.analyseItemClicks());
  console.log("PAGE VISITS ANALYSIS", analyser.analysePageVisits());

/*
  // let policy = new MostClickedItemListPolicy();
  let policy = new MostVisitedLinksPolicy();
  let adaptation = Highlight;

  adaptation.apply(menus, debug_policies[debug_policy_index], analyser);
*/

  ////////////////////////////////////////////////////////////
  // For test purposes: switch between policies

  let adaptation = Reorder;
  let adaptationPolicies = {
    "Most clicked items policy": new MostClickedItemListPolicy(),
    "Most visited pages policy": new MostVisitedPagesPolicy(),
    "Longest visit duration policy": new LongestVisitDurationPolicy(),
    "Most recent visits policy": new MostRecentVisitsPolicy(),
    "Serial-Position curve policy": new SerialPositionCurvePolicy()
  };

  let policyKey = localStorage.getItem("awm-debug-cur-policy-key") || Object.keys(adaptationPolicies)[0];

  function updatePolicy () {
    let policyKey = <string> $("#debug-switch-policy-menu").val();

    console.log("New policy: ", policyKey);

    adaptation.reset();
    adaptation.apply(menus, adaptationPolicies[policyKey], analyser);

    localStorage.setItem("awm-debug-cur-policy-key", policyKey);
  }

  // Add control buttons to the page
  let controlsContainer = $("<div>")
    .attr("id", "debug-controls-container");
  $("body").prepend(controlsContainer);

  controlsContainer.append($("<select>")
    .attr("id", "debug-switch-policy-menu")
    .change(event => { updatePolicy(); }));

  for (let key in adaptationPolicies) {
    let option = $("<option>")
      .attr("val", key)
      .html(key);

    if (key === policyKey) {
      option.prop("selected", true);
    }

    $("#debug-switch-policy-menu").append(option);
  }

  controlsContainer.append($("<button>")
    .html("Reset history (require page reloading)")
    .attr("id", "debug-reset-history-button")
    .click(event => { window["emptyDatabase"](); }));

    // Apply the selected adaptation on page load
    updatePolicy();
});
