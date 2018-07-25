import { MenuManager } from "../../elements/MenuManager";
import { DataManager } from "../../data/DataManager";
import { Item } from "../../elements/Item";
import { ItemGroup } from "../../elements/ItemGroup";


export interface ItemWithScore {
  item: Item;
  score: number;
}

export interface ItemGroupWithScore {
  group: ItemGroup;
  score: number;
}


export abstract class Policy {

  // Any concrete child class extending this one must define this field
  // It represents the policy name, and must be unique among all policies
  abstract readonly name: string;


  // Any concrete child class extending this one must implement this method
  // It should return a sorted array of items with their scores (from the given menus)
  abstract getSortedItemsWithScores (menuManager: MenuManager, dataManager?: DataManager): ItemWithScore[];

  // Only return a sorted list of items, from the one issued by getSortedItemsWithScores
  getSortedItems (menuManager: MenuManager, dataManager?: DataManager): Item[] {
    return this.getSortedItemsWithScores(menuManager, dataManager)
      .map((itemWithScore) => {
        return itemWithScore.item;
      });
  }


  // Default implementation which can be overidden by any child class
  // It should return a sorted array of item groups with their scores (from the given menus)
  getSortedItemGroupsWithScores (menuManager: MenuManager, dataManager?: DataManager): ItemGroupWithScore[] {
    let scorePerGroup = new Map<ItemGroup, number>();
    let sumOfScores = 0;

    // Get the scores of all items
    let sortedItemsWithScores = this.getSortedItemsWithScores(menuManager, dataManager);


    // Sum the indices for each group
    for (let itemWithScore of sortedItemsWithScores) {
      let score = itemWithScore.score;
      let group = itemWithScore.item.parent;

      if (! scorePerGroup.has(group)) {
        scorePerGroup.set(group, score);
      }
      else {
        let currentGroupScore = scorePerGroup.get(group);
        scorePerGroup.set(group, currentGroupScore + score);
      }

      sumOfScores += score;
    }

    // Sort the groups by the sum of their items' scores, in decreasing order
    return [...scorePerGroup.entries()]
      .sort((tuple1, tuple2) => {
        return tuple2[1] - tuple1[1];
      })
      .map((tuple) => {
        return {
          group: tuple[0],
          score: tuple[1] / sumOfScores
        };
      });
  }

  // Only return a sorted list of item groups, from the one issued by getSortedItemGroupsWithScores
  getSortedItemGroups (menuManager: MenuManager, dataManager?: DataManager): ItemGroup[] {
    return this.getSortedItemGroupsWithScores(menuManager, dataManager)
      .map((groupWithScore) => {
        return groupWithScore.group;
      });
  }
}
