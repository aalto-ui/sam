import { Menu } from "../../../elements/Menu";
import { DataManager } from "../../../data/DataManager";
import { Highlight } from "../Highlight";
import { ReorderItems } from "../ReorderItems";
import { Policy, ItemWithScore } from "../../policies/Policy";
import { Technique } from "../Technique";
import { AccessRankPolicy } from "../../policies/AccessRankPolicy";
import { Database } from "../../../data/Database";
import { Item } from "../../../elements/Item";


export const enum AdaptationState {
  NoAdaptation,
  LowHighlighting,
  HighHighlighting,
  HighHighlightingAndReordering
}

export interface ItemCharacteristics {
  state: AdaptationState,
  score: number,
  lastStateChangeScore: number
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

      apply () {
        let itemsToHighlightAtHighLevel = self.getItemsWithCurrentState(AdaptationState.HighHighlighting)
          .concat(self.getItemsWithCurrentState(AdaptationState.HighHighlightingAndReordering));

        let itemsToHighlight = itemsToHighlightAtHighLevel
          .concat(self.getItemsWithCurrentState(AdaptationState.LowHighlighting));

        this.itemsToHighlightAtHighLevel = new Set(itemsToHighlightAtHighLevel);
        this.onAllItems(itemsToHighlight);
      }
    };
  }

  private createProgressiveReorderItem (): ReorderItems {
    let self = this;

    return new class ProgressiveReorderItems extends ReorderItems {
      constructor () {
        super();
      }

      apply () {
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
          score: 0,
          lastStateChangeScore: 0
        };
      }
    }
  }

  // Save current item characterstics in the database persistent storage as the new "previous" ones
  private saveCurrentItemCharacteristics (database: Database) {
    database.persistentStorage.previousItemCharacteristics = JSON.parse(JSON.stringify(this.currentItemCharacteristics));
  }

  private computeItemAdaptationState (previousState: AdaptationState, previousScore: number, currentScore: number,
                                      lastStateChangeScore: number): AdaptationState {
    let scoreDifference = currentScore - lastStateChangeScore;
    if (Math.abs(scoreDifference) < 0.1) {
      return previousState;
    }

    switch (previousState) {
      case AdaptationState.NoAdaptation:
        if (currentScore > 0.1)
          return AdaptationState.LowHighlighting;
        else
          return AdaptationState.NoAdaptation;


       case AdaptationState.LowHighlighting:
         if (scoreDifference > 0.3)
           return AdaptationState.HighHighlighting;
         else if (scoreDifference < -0.2)
           return AdaptationState.NoAdaptation;
         else
           return AdaptationState.LowHighlighting;

        case AdaptationState.HighHighlighting:
          if (scoreDifference > 0.3)
            return AdaptationState.HighHighlightingAndReordering;
          else if (scoreDifference < -0.2)
            return AdaptationState.LowHighlighting;
          else
            return AdaptationState.HighHighlighting;

       case AdaptationState.HighHighlightingAndReordering:
         if (scoreDifference < -0.4)
           return AdaptationState.HighHighlighting;
         else
          return AdaptationState.HighHighlightingAndReordering;
    }
  }

  private computeCurrentItemCharacteristics (sortedItemsWithScores: ItemWithScore[]) {
    let currentItemCharacteristics = {};

    for (let itemWithScore of sortedItemsWithScores) {
      let itemID = itemWithScore.item.id;

      let previousScore = this.previousItemCharacteristics[itemID].score;
      let lastStateChangeScore = this.previousItemCharacteristics[itemID].lastStateChangeScore;
      let currentScore = itemWithScore.score;

      //if (previousScore !== lastStateChangeScore)
      //  console.log(previousScore, "==>", currentScore, itemWithScore.item);

      let previousState = this.previousItemCharacteristics[itemID].state;
      let currentState = this.computeItemAdaptationState(previousState, previousScore, currentScore, lastStateChangeScore);

      currentItemCharacteristics[itemID] = {
        state: currentState,
        score: currentScore,
        lastStateChangeScore: previousState === currentState
                            ? this.previousItemCharacteristics[itemID].lastStateChangeScore
                            : currentScore
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

  apply (menus: Menu[], _, dataManager?: DataManager) {
    let allItems = Menu.getAllMenusItems(menus);
    let sortedItemsWithScores = this.policy.getSortedItemsWithScores(menus, dataManager);

    this.allItems = allItems;

    this.loadOrInitPreviousItemCharactertics(allItems, dataManager.database);
    this.computeCurrentItemCharacteristics(sortedItemsWithScores);
    this.saveCurrentItemCharacteristics(dataManager.database);

    console.log("Current characterstics", this.currentItemCharacteristics);

    this.progressiveHighlight.apply(null, null);
    this.progressiveReorder.apply(null, null);
  }
}
