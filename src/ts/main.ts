import * as $ from "jquery";
import { Menu } from "./Menus/Menu";
import { AdaptiveWebMenus } from "./awm";


$(document).ready(function () {
  // DEBUG: setup for page<1-6>.html
  // TODO: make a simpler init for lists of links/no group, e.g. automatically using :eq(pos)
  let mainMenu = Menu.fromSelectors("#main-menu", {
    ".menu-group": [0,1,2,3,4,5].map(i => { return `li:eq(${i})`})
  });

  let menus = [mainMenu];
  console.log("Menu", menus);

  let awm = new AdaptiveWebMenus(menus);
  console.log("AWM library initialised");


  // DEBUG
  window["awm"] = awm;


  ////////////////////////////////////////////////////////////
  // DEBUG: user interface for controlling the library

  let adaptations = awm.adaptations;

  let techniqueName = localStorage.getItem("awm-debug-technique-name")
                   || Object.keys(adaptations)[0];
  let policyName = localStorage.getItem("awm-debug-policy-name")
                || Object.keys(adaptations[techniqueName].policies)[0];

                console.log("p name", policyName);

  function updateTechnique () {
    techniqueName = <string> $("#awm-debug-switch-technique-menu").val();
    policyName = <string> $("#awm-debug-switch-policy-menu").val();

    awm.switchAdaptationTechnique(techniqueName, policyName);

    localStorage.setItem("awm-debug-technique-name", techniqueName);
    localStorage.setItem("awm-debug-policy-name", policyName);

    updatePolicyOptions();
  }

  function updatePolicy () {
    policyName = <string> $("#awm-debug-switch-policy-menu").val();

    awm.switchAdaptationPolicy(policyName);

    localStorage.setItem("awm-debug-policy-name", policyName);
  }

  function updatePolicyOptions () {
    $("#awm-debug-switch-policy-menu").empty();

    for (let name of awm.getAllAdaptationPoliciesNames(techniqueName)) {
      let option = $("<option>")
        .attr("val", name)
        .html(name);

      if (name === policyName) {
        option.prop("selected", true);
      }

      $("#awm-debug-switch-policy-menu").append(option);
    }
  }

  // Add a control container to the page
  let controlsContainer = $("<div>")
    .attr("id", "awm-debug-controls-container");
  $("body").prepend(controlsContainer);

  // List of techniques (static)
  controlsContainer.append($("<label>")
    .attr("for", "awm-debug-switch-technique-menu")
    .html("Technique:"));

  controlsContainer.append($("<select>")
    .attr("id", "awm-debug-switch-technique-menu")
    .change(event => { updateTechnique(); }));

  for (let name of awm.getAllAdaptationTechniqueNames()) {
    let option = $("<option>")
      .attr("val", name)
      .html(name);

    if (name === techniqueName) {
      option.prop("selected", true);
    }

    $("#awm-debug-switch-technique-menu").append(option);
  }

  // List of policies (dynamic)
  controlsContainer.append($("<label>")
    .attr("for", "awm-debug-switch-policy-menu")
    .html("Policy:"));

  controlsContainer.append($("<select>")
    .attr("id", "awm-debug-switch-policy-menu")
    .change(event => { updatePolicy(); }));

  updatePolicyOptions();

  // History cleaner
  controlsContainer.append($("<button>")
    .html("Clear history (require page reloading)")
    .attr("id", "awm-debug-clear-history-button")
    .click(event => { awm.clearHistory(); }));

  // Apply the current technique + policy on page load
  updateTechnique();
});
