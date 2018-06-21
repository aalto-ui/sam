import { Technique } from "./Techniques/Technique";
import { Policy } from "./Policies/Policy";



// Interface of a complete adaptation,
// It is formed by one technique, all applicable policies + the current one
export interface Adaptation {
  technique: Technique;
  policies: {[key: string]: Policy};

  // Currently selected policy: it must refer to any item of the policies field, or null
  selectedPolicy: Policy | null;
}
