import { AdaptationStyle } from "./AdaptationStyle";


// This technique is doing nothing (no change to the page)
// Its only purpose is to be available (with the right type) as a baseline
export class Identity implements AdaptationStyle {

  // ============================================================ PROPERTIES ===

  readonly name: string = "Identity";


  // =========================================================== CONSTRUCTOR ===

  // =============================================================== METHODS ===

  reset () {
    // Nothing to do
  }

  apply () {
    // Nothing to do
  }
}
