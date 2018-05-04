import * as $ from "jquery";
import AdaptiveWebMenus from "./AdaptiveWebMenus";


export class DebugDisplay {
  // Related instance of the library
  private readonly awm: AdaptiveWebMenus;

  // State of the debug display
  private activated: boolean;

  // Referene to the control container node
  private controlsContainerNode: JQuery;

  constructor (awm: AdaptiveWebMenus, activate: boolean = true) {
    this.awm = awm;
    this.activated = activate;

    // Add the UI controls to the pages
    this.controlsContainerNode = null;
    this.addAllControls();
  }

  private updateTechnique () {
    let techniqueName = <string> $("#awm-debug-switch-technique-menu").val();

    this.awm.switchToTechnique(techniqueName);

    // Note: null policy names are converted to empty strings
    let policyName = this.awm.getCurrentPolicyName();
    policyName = policyName ? policyName : "";

    localStorage.setItem("awm-debug-technique-name", techniqueName);
    localStorage.setItem("awm-debug-policy-name", policyName);

    this.updatePolicyListNode();
  }

  private updatePolicy () {
    let policyName = <string> $("#awm-debug-switch-policy-menu").val();

    this.awm.switchToPolicy(policyName);

    // Note: null policy names are converted to empty strings
    policyName = policyName ? policyName : "";
    localStorage.setItem("awm-debug-policy-name", policyName);
  }

  private updatePolicyListNode () {
    $("#awm-debug-switch-policy-menu").empty();

    for (let name of this.awm.getAllCurrentTechniquePolicyNames()) {
      let option = $("<option>")
        .attr("val", name)
        .html(name);

      if (name === this.awm.getCurrentPolicyName()) {
        option.prop("selected", true);
      }

      $("#awm-debug-switch-policy-menu").append(option);
    }
  }

  private addControlContainerNode () {
    let controlsContainer = $("<div>")
      .attr("id", "awm-debug-controls-container");
    $("body").prepend(controlsContainer);

    this.controlsContainerNode = controlsContainer;
  }

  private addTechniqueListNode () {
    this.controlsContainerNode.append($("<label>")
      .attr("for", "awm-debug-switch-technique-menu")
      .html("Technique:"));

    this.controlsContainerNode.append($("<select>")
      .attr("id", "awm-debug-switch-technique-menu")
      .change(event => { this.updateTechnique(); }));

    for (let name of this.awm.getAllAdaptationTechniqueNames()) {
      let option = $("<option>")
        .attr("val", name)
        .html(name);

      if (name === this.awm.getCurrentTechniqueName()) {
        option.prop("selected", true);
      }

      $("#awm-debug-switch-technique-menu").append(option);
    }
  }

  private addPolicyListNode () {
    this.controlsContainerNode.append($("<label>")
      .attr("for", "awm-debug-switch-policy-menu")
      .html("Policy:"));

    this.controlsContainerNode.append($("<select>")
      .attr("id", "awm-debug-switch-policy-menu")
      .change(event => { this.updatePolicy(); }));

    this.updatePolicyListNode();
  }

  private addClearHistoryButtonNode () {
    this.controlsContainerNode.append($("<button>")
      .html("Clear history (require page reloading)")
      .attr("id", "awm-debug-clear-history-button")
      .click(event => { this.awm.clearHistory(); }));
  }

  private addAllControls () {
    this.addControlContainerNode();
    this.addTechniqueListNode();
    this.addPolicyListNode();
    this.addClearHistoryButtonNode();
  }
}
