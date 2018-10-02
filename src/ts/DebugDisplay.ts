import * as $ from "jquery";
import { AdaptiveWebMenus } from "./AdaptiveWebMenus";
import { AVAILABLE_TECHNIQUE_NAMES, AVAILABLE_POLICY_NAMES } from "./adaptations/AdaptationManager";


export class DebugDisplay {

  // ============================================================ PROPERTIES ===

  /**
   * AWM library instance owning this debug display instance.
   */
  private readonly awm: AdaptiveWebMenus;

  /**
   * Flag indicating whether the debug display is activated or not.
   */
  private activated: boolean;

  /**
   * Node containing all the debug displayed controls.
   */
  private controlsContainerNode: JQuery;


  // =========================================================== CONSTRUCTOR ===

  /**
   * Creates a new instance of debug display.
   *
   * @param awm      AWM library instance owning this debug display.
   * @param activate Control the debug display (activated on `true`).
   */
  constructor (awm: AdaptiveWebMenus, activate: boolean = true) {
    this.awm = awm;
    this.controlsContainerNode = null;

    if (activate) {
      this.activate();
    }
  }


  // =============================================================== METHODS ===

  /**
   * Update the adaptation technique from the selected one.
   */
  private updateTechnique () {
    let techniqueName = $("#awm-debug-switch-technique-menu").val() as string;

    this.awm.adaptationManager.switchToTechnique(techniqueName);
  }

  /**
   * Update the adatation policy from the selected one.
   */
  private updatePolicy () {
    let policyName = $("#awm-debug-switch-policy-menu").val() as string;

    this.awm.adaptationManager.switchToPolicy(policyName);
  }


  // ===========================================================================
  // Visual controls building
  // ===========================================================================

  /**
   * Create a container for the debug display, and prepend it to the page body.
   */
  private addControlContainerNode () {
    let controlsContainer = $("<div>")
      .attr("id", "awm-debug-controls-container");
    $("body").prepend(controlsContainer);

    this.controlsContainerNode = controlsContainer;
  }

  /**
   * Create a list of adaptation techniques, and append it to the container.
   */
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

  /**
   * Create a list of adaptation policies, and append it to the container.
   */
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

  /**
   * Create a button to clear the history, and append it to the container.
   */
  private addClearHistoryButtonNode () {
    this.controlsContainerNode
      .append($("<button>")
      .html("Clear history (require page reloading)")
      .attr("id", "awm-debug-clear-history-button")
      .on("click", () => {
        this.awm.clearHistory();
      }));
  }

  /**
   * Create and append the container and all its controls.
   * This will display the full debug display panel on the page.
   */
  private addAllControls () {
    this.addControlContainerNode();
    this.addTechniqueListNode();
    this.addPolicyListNode();
    this.addClearHistoryButtonNode();
  }

  /**
   * Remove the container and all its controls from the page.
   * This will remove the full debug display panel from the page.
   */
  private removeAllControls () {
    this.controlsContainerNode.remove();
    this.controlsContainerNode = null;
  }

  // ===========================================================================
  // De-activation of the visual controls
  // ===========================================================================

  /**
   * Activate the debug display, and display the debug display panel.
   */
  activate () {
    this.activated = true;
    this.addAllControls();
  }

  /**
   * Desactivate the debug display, and hide the debug display panel.
   */
  desactivate () {
    this.activated = false;
    this.removeAllControls();
  }
}
