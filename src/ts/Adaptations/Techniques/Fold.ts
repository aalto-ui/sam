import * as $ from "jquery";
import { AdaptationTechnique } from "../Adaptation";
import { AdaptiveElement } from "../../Elements/AdaptiveElement";
import { Menu } from "../../Elements/Menu";
import { ItemListPolicy } from "../Policies/ItemListPolicy";
import { DataAnalyser } from "../../Data/DataAnalyser";

import { ItemGroup } from "../../Elements/ItemGroup";
import { Item } from "../../Elements/Item";


export class Fold implements AdaptationTechnique {
  private static readonly FOLDED_CLASS: string = "awm-folded";
  private static readonly FOLD_BUTTON_CLASS: string = "awm-fold-button";
  private static readonly FOLDABLE_ELEMENT_CLASS: string = "awm-foldable";

  // Maximum number of items to always display, for each group
  maxNbDisplayedItemsPerGroup: number = 3;

  private foldableItemParents: Set<HTMLElement>;


  constructor () {
    this.foldableItemParents = new Set();
  }

  private static switchFoldState (parentNode: JQuery, foldButton: JQuery) {
    if (parentNode.hasClass(Fold.FOLDED_CLASS)) {
      parentNode.removeClass(Fold.FOLDED_CLASS);
      foldButton.html("Show less");
    }
    else {
      parentNode.addClass(Fold.FOLDED_CLASS);
      foldButton.html("Show more");
    }
  }

  private static createFoldButton (parentNode: JQuery): JQuery {
    let button = $("<button>")
      .addClass(Fold.FOLD_BUTTON_CLASS)
      .attr("type", "button");

    button.on("click", function () {
      Fold.switchFoldState(parentNode, button);
    });

    // TODO: REFACTOR
    // By default, the menu is folded
    Fold.switchFoldState(parentNode, button);

    return button;
  }

  private appendFoldButtonsToAllFoldableItemParents () {
    this.foldableItemParents.forEach((element) => {
      let parentNode = $(element);
      let foldButton = Fold.createFoldButton(parentNode);

      $(element).append(foldButton);
    });
  }

  private makeItemFoldable (item: Item) {
    item.node.addClass(Fold.FOLDABLE_ELEMENT_CLASS);
    this.foldableItemParents.add(item.node.parent()[0]);
  }

  private makeAllItemsFoldable (items: Item[]) {
    for (let item of items) {
      this.makeItemFoldable(item);
    }
  }

  reset () {
    this.foldableItemParents.forEach((element) => {
      let parent = $(element);
      let children = parent.children();

      children.removeClass(Fold.FOLDABLE_ELEMENT_CLASS);
      parent.removeClass(Fold.FOLDED_CLASS);
      parent.find("." + Fold.FOLD_BUTTON_CLASS).remove();
    });

    this.foldableItemParents.clear();
  }

  apply (menus: Menu[], policy: ItemListPolicy, analyser?: DataAnalyser) {
    let items = policy.getItemList(menus, analyser);

    // Move items into folded menus independently for each group
    let itemsSplitByGroup = Item.splitAllByGroup(items);
    for (let sameGroupItems of itemsSplitByGroup) {
      // Only keep items which must be moved into the folded menu
      sameGroupItems.splice(0, this.maxNbDisplayedItemsPerGroup);

      this.makeAllItemsFoldable(sameGroupItems);
    }

    this.appendFoldButtonsToAllFoldableItemParents();
  }
}
