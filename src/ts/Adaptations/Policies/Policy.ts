import { DataAnalyser } from "../../Data/DataAnalyser";
import { Menu } from "../../Elements/Menu";
import { Item } from "../../Elements/Item";
import { ItemGroup } from "../../Elements/ItemGroup";


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


  constructor () { }


  // Any concrete child class extending this one must implement this method
  // It should return a sorted array of items with their scores (from the given menus)
  abstract getSortedItemsWithScores (menus: Menu[], analyser?: DataAnalyser): ItemWithScore[];

  // Only return a sorted list of items, from the one issued by getSortedItemsWithScores
  getSortedItems (menus: Menu[], analyser?: DataAnalyser): Item[] {
    return this.getSortedItemsWithScores(menus, analyser)
      .map((itemWithScore) => {
        return itemWithScore.item;
      });
  }


  // Default implementation which can be overidden by any child class
  // It should return a sorted array of item groups with their scores (from the given menus)
  getSortedItemGroupsWithScores (menus: Menu[], analyser?: DataAnalyser): ItemGroupWithScore[] {
    let scorePerGroup = new Map<ItemGroup, number>();
    let sumOfScores = 0;

    // Get the scores of all items
    let sortedItemsWithScores = this.getSortedItemsWithScores(menus, analyser);


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
  getSortedItemGroups (menus: Menu[], analyser?: DataAnalyser): ItemGroup[] {
    return this.getSortedItemGroupsWithScores(menus, analyser)
      .map((groupWithScore) => {
        return groupWithScore.group;
      });
  }
}
