/** @module gui */

import * as $ from "jquery";
import { SelfAdaptingMenus } from "./SelfAdaptingMenus";
import { AVAILABLE_STYLE_NAMES, AVAILABLE_POLICY_NAMES } from "./adaptations/AdaptationManager";


export class VisualControls {

  // ============================================================ PROPERTIES ===

  /** Instance of SAM to control. */
  private readonly sam: SelfAdaptingMenus;

  /**
   * Flag indicating whether the controls should be displayed or not.
   * If `true`, they should be displayed. 
   */
  private display: boolean;

  /** Node containing all the controls' nodes. */
  private controlsContainerNode: JQuery;


  // =========================================================== CONSTRUCTOR ===

  /**
   * Creates a new instance of visual controls.
   *
   * @param sam     Instance of SAM to control.
   * @param display Indicate whether to display the controls or not (visible on `true`).
   */
  constructor (sam: SelfAdaptingMenus, display: boolean = true) {
    this.sam = sam;
    this.controlsContainerNode = null;

    if (display) {
      this.show();
    }
  }


  // =============================================================== METHODS ===

  /**
   * Update the adaptation style from the selected one.
   */
  private updateAdaptationStyle () {
    let styleName = $("#sam-gui-switch-style-menu").val() as string;

    this.sam.adaptationManager.switchToStyle(styleName);
  }

  /**
   * Update the target policy from the selected one.
   */
  private updateTargetPolicy () {
    let policyName = $("#sam-gui-switch-policy-menu").val() as string;

    this.sam.adaptationManager.switchToPolicy(policyName);
  }


  // ===========================================================================
  // Control nodes
  // ===========================================================================

  /**
   * Create a container for the gui display, and prepend it to the page body.
   */
  private addControlContainerNode () {
    let controlsContainer = $("<div>")
      .attr("id", "sam-gui-controls-container");
    $("body").prepend(controlsContainer);

    this.controlsContainerNode = controlsContainer;
  }

  /**
   * Create a list of adaptation styles, attach an event handler to the list
   * to update the style on `change` event, and append it to the container.
   */
  private addStyleListNode () {
    this.controlsContainerNode
      .append($("<label>")
      .attr("for", "sam-gui-switch-style-menu")
      .html("Style:"));

    this.controlsContainerNode
      .append($("<select>")
      .attr("id", "sam-gui-switch-style-menu")
      .on("change", (_) => {
        this.updateAdaptationStyle();
      }));

    for (let name of AVAILABLE_STYLE_NAMES) {
      let option = $("<option>")
        .attr("val", name)
        .html(name);

      if (name === this.sam.adaptationManager.getCurrentStyleName()) {
        option.prop("selected", true);
      }

      $("#sam-gui-switch-style-menu").append(option);
    }
  }

    /**
   * Create a list of target policies, attach an event handler to the list
   * to update the policy on `change` event, and append it to the container.
   */
  private addPolicyListNode () {
    this.controlsContainerNode
      .append($("<label>")
      .attr("for", "sam-gui-switch-policy-menu")
      .html("Policy:"));

    this.controlsContainerNode
      .append($("<select>")
      .attr("id", "sam-gui-switch-policy-menu")
      .on("change", (_) => {
        this.updateTargetPolicy();
      }));

    for (let name of AVAILABLE_POLICY_NAMES) {
      let option = $("<option>")
        .attr("val", name)
        .html(name);

      if (name === this.sam.adaptationManager.getCurrentPolicyName()) {
        option.prop("selected", true);
      }

      $("#sam-gui-switch-policy-menu").append(option);
    }
  }

  /**
   * Create a button to clear the history, and append it to the container.
   */
  private addClearHistoryButtonNode () {
    this.controlsContainerNode
      .append($("<button>")
      .html("Clear history (require page reloading)")
      .attr("id", "sam-gui-clear-history-button")
      .on("click", () => {
        this.sam.clearHistory();
      }));
  }

  /**
   * Create the container and all the control nodes, and append them to the DOM.
   * This will display the control panel on the page.
   */
  private addAllControls () {
    this.addControlContainerNode();
    this.addStyleListNode();
    this.addPolicyListNode();
    this.addClearHistoryButtonNode();
  }

  /**
   * Remove the container node from the DOM.
   * This will hide the control panel from the page.
   */
  private removeAllControls () {
    this.controlsContainerNode.remove();
    this.controlsContainerNode = null;
  }

  // ===========================================================================
  // Visibility control
  // ===========================================================================

  /**
   * Show the control panel.
   */
  show () {
    this.display = true;
    this.addAllControls();
  }

  /**
   * Hide the control panel.
   */
  hide () {
    this.display = false;
    this.removeAllControls();
  }
}
