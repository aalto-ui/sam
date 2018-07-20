import { Highlight } from "./techniques/Highlight";
import { Identity } from "./techniques/Identity";
import { ReorderItems } from "./techniques/ReorderItems";
import { HighlightAndReorderItems } from "./techniques/composites/HighlightAndReorderItems";
import { Fold } from "./techniques/Fold";
import { ReorderItemsAndFold } from "./techniques/composites/ReorderItemsAndFold";
import { HighlightReorderItemsAndFold } from "./techniques/composites/HighlightReorderItemsAndFold";
import { ReorderGroups } from "./techniques/ReorderGroups";
import { HighlightAndReorderAll } from "./techniques/composites/HighlightAndReorderAll";
import { ProgressiveHighlightAndReorderItems } from "./techniques/composites/ProgressiveHighlightAndReorderItems";

import { AccessRankPolicy } from "./policies/AccessRankPolicy";
import { LongestVisitDurationPolicy } from "./policies/LongestVisitDurationPolicy";
import { MostClickedItemListPolicy } from "./policies/MostClickedItemsPolicy";
import { MostRecentVisitsPolicy } from "./policies/MostRecentVisitsPolicy";
import { MostVisitedPagesPolicy } from "./policies/MostVisitedPagesPolicy";
import { SerialPositionCurvePolicy } from "./policies/SerialPositionCurvePolicy";


export const AVAILABLE_TECHNIQUES = [
  new Identity(),
  new Highlight(),
  new ReorderItems(),
  new HighlightAndReorderItems(),
  new Fold(),
  new ReorderItemsAndFold(),
  new HighlightReorderItemsAndFold(),
  new ReorderGroups(),
  new HighlightAndReorderAll(),
  new ProgressiveHighlightAndReorderItems()
];

export const AVAILABLE_TECHNIQUE_NAMES = AVAILABLE_TECHNIQUES.map(technique => {
  return technique.name;
});

export type AvailableTechnique = typeof AVAILABLE_TECHNIQUES[0];


export const AVAILABLE_POLICIES = [
  new MostClickedItemListPolicy(),
  new MostVisitedPagesPolicy(),
  new MostRecentVisitsPolicy(),
  new LongestVisitDurationPolicy(),
  new SerialPositionCurvePolicy(),
  new AccessRankPolicy()
];

export const AVAILABLE_POLICY_NAMES = AVAILABLE_POLICIES.map(policy => {
  return policy.name;
});

export type AvailablePolicies = typeof AVAILABLE_POLICIES[0];
