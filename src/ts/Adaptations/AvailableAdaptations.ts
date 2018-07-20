import { Highlight } from "./techniques/Highlight";
import { Identity } from "./techniques/Identity";
import { ReorderItems } from "./techniques/ReorderItems";
import { HighlightAndReorderItems } from "./techniques/HighlightAndReorderItems";
import { Fold } from "./techniques/Fold";
import { ReorderItemsAndFold } from "./techniques/ReorderItemsAndFold";
import { HighlightReorderItemsAndFold } from "./techniques/HighlightReorderItemsAndFold";
import { ReorderGroups } from "./techniques/ReorderGroups";
import { HighlightAndReorderAll } from "./techniques/HighlightAndReorderAll";
import { ProgressiveHighlightAndReorderItems } from "./techniques/ProgressiveHighlightAndReorderItems";

import { AccessRankPolicy } from "./Policies/AccessRankPolicy";
import { LongestVisitDurationPolicy } from "./Policies/LongestVisitDurationPolicy";
import { MostClickedItemListPolicy } from "./Policies/MostClickedItemsPolicy";
import { MostRecentVisitsPolicy } from "./Policies/MostRecentVisitsPolicy";
import { MostVisitedPagesPolicy } from "./Policies/MostVisitedPagesPolicy";
import { SerialPositionCurvePolicy } from "./Policies/SerialPositionCurvePolicy";


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
