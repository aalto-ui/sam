import * as $ from "jquery";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { Highlight } from "./Highlight";
import { ReorderItems } from "./ReorderItems";
import { Policy, ItemWithScore } from "../Policies/Policy";
import { Technique } from "./Technique";
import { AccessRankPolicy } from "../Policies/AccessRankPolicy";
import { Database } from "../../Data/Database";
import { Item } from "../../Elements/Item";


export const enum AdaptationState {
  NoAdaptation,
  LowHighlighting,
  HighHighlighting,
  HighHighlightingAndReordering
}

export interface ItemCharacteristics {
  state: AdaptationState,
  score: number
}


export class ProgressiveHighlightAndReorderItems implements Technique<Policy> {

  readonly name: string = "Progressive HL + R items";

  private readonly policy: Policy;

  private allItems: Item[];
  private previousItemCharacteristics: {[itemID: string]: ItemCharacteristics}
  private currentItemCharacteristics: {[itemID: string]: ItemCharacteristics}

  private readonly progressiveHighlight: Highlight;
  private readonly progressiveReorder: ReorderItems;


  constructor () {
    this.policy = new AccessRankPolicy();

    this.allItems = null;
    this.previousItemCharacteristics = null;
    this.currentItemCharacteristics = null;

    this.progressiveHighlight = this.createProgressiveHighlight();
    this.progressiveReorder = this.createProgressiveReorderItem();
  }

  private getItemsWithCurrentState (state: AdaptationState) {
    let itemIDsWithMatchingState = Object.keys(this.currentItemCharacteristics)
      .filter(itemID => {
        return this.currentItemCharacteristics[itemID].state === state;
      });

    return this.allItems.filter(item => {
      return itemIDsWithMatchingState.find((itemID) => {
        return item.id === itemID
      }) !== undefined;
    })
  }

  private createProgressiveHighlight (): Highlight {
    let self = this;

    return new class ProgressiveHighlight extends Highlight {
      constructor () {
        super();
      }

      apply (menus: Menu[], policy: Policy, analyser?: DataAnalyser) {
        let itemsToHighlightAtHighLevel = self.getItemsWithCurrentState(AdaptationState.HighHighlighting)
          .concat(self.getItemsWithCurrentState(AdaptationState.HighHighlightingAndReordering));

        let itemsToHighlight = itemsToHighlightAtHighLevel
          .concat(self.getItemsWithCurrentState(AdaptationState.LowHighlighting));

        this.onAllItems(itemsToHighlight, new Set(itemsToHighlightAtHighLevel));
      }
    };
  }

  private createProgressiveReorderItem (): ReorderItems {
    let self = this;

    return new class ProgressiveReorderItems extends ReorderItems {
      constructor () {
        super();
      }

      apply (menus: Menu[], policy: Policy, analyser?: DataAnalyser) {
        let sortedItemsToReorder = self.getItemsWithCurrentState(AdaptationState.HighHighlightingAndReordering)
          .sort((item1, item2) => {
            return self.currentItemCharacteristics[item2.id].score
                 - self.currentItemCharacteristics[item1.id].score;
          });

        this.reorderAllElements(sortedItemsToReorder);
      }
    };
  }


  // Load the previous item characterstics from the database persistent storage,
  // and then checks whether all given items have previous characterstics or not
  // In case they do not have any, they are assigned initial characterstics (no adaptation, score of 0)
  private loadOrInitPreviousItemCharactertics (items: Item[], database: Database) {
    this.previousItemCharacteristics = database.persistentStorage.previousItemCharacteristics;
    if (this.previousItemCharacteristics === undefined) {
      this.previousItemCharacteristics = {};
    }

    for (let item of items) {
      let itemID = item.id;
      if (! (itemID in this.previousItemCharacteristics)) {
        this.previousItemCharacteristics[itemID] = {
          state: AdaptationState.NoAdaptation,
          score: 0
        };
      }
    }
  }

  // Save current item characterstics in the database persistent storage as the new "previous" ones
  private saveCurrentItemCharacteristics (database: Database) {
    database.persistentStorage.previousItemCharacteristics = JSON.parse(JSON.stringify(this.currentItemCharacteristics));
  }

  private computeItemAdaptationState (previousState: AdaptationState, previousScore: number, currentScore: number): AdaptationState {
    switch (previousState) {
      case AdaptationState.NoAdaptation:
        return previousScore < currentScore
             ? AdaptationState.LowHighlighting
             : AdaptationState.NoAdaptation;

       case AdaptationState.LowHighlighting:
         return previousScore < currentScore
              ? AdaptationState.HighHighlighting
              : AdaptationState.LowHighlighting;

        case AdaptationState.HighHighlighting:
          return previousScore < currentScore
               ? AdaptationState.HighHighlightingAndReordering
               : AdaptationState.LowHighlighting;

       case AdaptationState.HighHighlightingAndReordering:
         return previousScore <= currentScore
              ? AdaptationState.HighHighlightingAndReordering
              : AdaptationState.HighHighlighting;
    }
  }

  private computeCurrentItemCharacteristics (sortedItemsWithScores: ItemWithScore[]) {
    let currentItemCharacteristics = {};

    for (let itemWithScore of sortedItemsWithScores) {
      let itemID = itemWithScore.item.id;

      let previousScore = this.previousItemCharacteristics[itemID].score;
      let currentScore = itemWithScore.score;

      //if (previousScore !== lastStateChangeScore)
      //  console.log(previousScore, "==>", currentScore, itemWithScore.item);

      let previousState = this.previousItemCharacteristics[itemID].state;
      let currentState = this.computeItemAdaptationState(previousState, previousScore, currentScore);

      currentItemCharacteristics[itemID] = {
        score: currentScore,
        state: currentState
      };
    }

    this.currentItemCharacteristics = currentItemCharacteristics;
  }

  reset () {
    this.progressiveReorder.reset();
    this.progressiveHighlight.reset();

    this.allItems = null;
    this.previousItemCharacteristics = null;
    this.currentItemCharacteristics = null;
  }

  apply (menus: Menu[], policy: AccessRankPolicy, analyser: DataAnalyser, database: Database) {
    let allItems = Menu.getAllMenusItems(menus);
    let sortedItemsWithScores = this.policy.getSortedItemsWithScores(menus, analyser);

    this.allItems = allItems;

    this.loadOrInitPreviousItemCharactertics(allItems, database);
    this.computeCurrentItemCharacteristics(sortedItemsWithScores);
    this.saveCurrentItemCharacteristics(database);

    console.log("Current characterstics", this.currentItemCharacteristics);

    this.progressiveHighlight.apply(null, null);
    this.progressiveReorder.apply(null, null);
  }
}
