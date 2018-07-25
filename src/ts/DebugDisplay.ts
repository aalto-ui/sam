import * as $ from "jquery";
import { AdaptiveWebMenus } from "./AdaptiveWebMenus";
import { AVAILABLE_TECHNIQUE_NAMES, AVAILABLE_POLICY_NAMES } from "./adaptations/AvailableAdaptations";


export class DebugDisplay {

  /*************************************************************** PROPERTIES */

  // Related instance of the library
  private readonly awm: AdaptiveWebMenus;

  // State of the debug display
  private activated: boolean;

  // Referene to the control container node
  private controlsContainerNode: JQuery;


  /************************************************************** CONSTRUCTOR */

  constructor (awm: AdaptiveWebMenus, activate: boolean = true) {
    this.awm = awm;
    this.controlsContainerNode = null;

    if (activate) {
      this.activate();
    }
  }


  /****************************************************************** METHODS */

  private updateTechnique () {
    let techniqueName = $("#awm-debug-switch-technique-menu").val() as string;

    this.awm.adaptationManager.switchToTechnique(techniqueName);
  }

  private updatePolicy () {
    let policyName = $("#awm-debug-switch-policy-menu").val() as string;

    this.awm.adaptationManager.switchToPolicy(policyName);
  }

  private addControlContainerNode () {
    let controlsContainer = $("<div>")
      .attr("id", "awm-debug-controls-container");
    $("body").prepend(controlsContainer);

    this.controlsContainerNode = controlsContainer;
  }

  private addTechniqueListNode () {
    this.controlsContainerNode
      .append($("<label>")
      .attr("for", "awm-debug-switch-technique-menu")
      .html("Technique:"));

    this.controlsContainerNode
      .append($("<select>")
      .attr("id", "awm-debug-switch-technique-menu")
      .on("change", (_) => {
        this.updateTechnique();
      }));

    for (let name of AVAILABLE_TECHNIQUE_NAMES) {
      let option = $("<option>")
        .attr("val", name)
        .html(name);

      if (name === this.awm.adaptationManager.getCurrentTechniqueName()) {
        option.prop("selected", true);
      }

      $("#awm-debug-switch-technique-menu").append(option);
    }
  }

  private addPolicyListNode () {
    this.controlsContainerNode
      .append($("<label>")
      .attr("for", "awm-debug-switch-policy-menu")
      .html("Policy:"));

    this.controlsContainerNode
      .append($("<select>")
      .attr("id", "awm-debug-switch-policy-menu")
      .on("change", (_) => {
        this.updatePolicy();
      }));

    for (let name of AVAILABLE_POLICY_NAMES) {
      let option = $("<option>")
        .attr("val", name)
        .html(name);

      if (name === this.awm.adaptationManager.getCurrentPolicyName()) {
        option.prop("selected", true);
      }

      $("#awm-debug-switch-policy-menu").append(option);
    }
  }

  private addClearHistoryButtonNode () {
    this.controlsContainerNode
      .append($("<button>")
      .html("Clear history (require page reloading)")
      .attr("id", "awm-debug-clear-history-button")
      .on("click", () => {
        this.awm.clearHistory();
      }));
  }

  private addAllControls () {
    this.addControlContainerNode();
    this.addTechniqueListNode();
    this.addPolicyListNode();
    this.addClearHistoryButtonNode();
  }

  private removeAllControls () {
    this.controlsContainerNode.remove();
    this.controlsContainerNode = null;
  }

  activate () {
    this.activated = true;
    this.addAllControls();
  }

  desactivate () {
    this.activated = false;
    this.removeAllControls();
  }
}
