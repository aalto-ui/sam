/** @module adaptation */

import { AdaptationStyle } from "./AdaptationStyle";


// This style is doing nothing (no change to the page)
// Its only purpose is to be available (with the right type) as a baseline
export class Identity implements AdaptationStyle {

  // ============================================================ PROPERTIES ===

  readonly name: string = "Identity";


  // =========================================================== CONSTRUCTOR ===

  // =============================================================== METHODS ===

  cancel () {
    // Nothing to do
  }

  apply () {
    // Nothing to do
  }
}
