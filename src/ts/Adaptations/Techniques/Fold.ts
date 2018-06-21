import * as $ from "jquery";
import { AdaptiveElement } from "../../Elements/AdaptiveElement";
import { Menu } from "../../Elements/Menu";
import { DataAnalyser } from "../../Data/DataAnalyser";
import { ItemGroup } from "../../Elements/ItemGroup";
import { Item } from "../../Elements/Item";
import { Policy } from "../Policies/Policy";
import { Technique } from "./Technique";


export class Fold implements Technique<Policy> {
  private static readonly FOLDED_CLASS: string = "awm-folded";
  private static readonly FOLD_BUTTON_CLASS: string = "awm-fold-button";
  private static readonly FOLDABLE_ELEMENT_CLASS: string = "awm-foldable";

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

  private getMaxNbItemsToDisplayInGroup (nbItemsInGroup: number): number {
    return Math.ceil(Math.sqrt(nbItemsInGroup));
  }

  apply (menus: Menu[], policy: Policy, analyser?: DataAnalyser) {
    let items = policy.getSortedItems(menus, analyser);

    // Move items into folded menus independently for each group
    let itemsSplitByGroup = Item.splitAllByGroup(items);
    for (let sameGroupItems of itemsSplitByGroup) {
      // Only keep items which must be moved into the folded menu (i.e. remove the top ones from the array)
      let totalNbGroupItems = sameGroupItems[0].parent.items.length;
      let nbItemToKeep = this.getMaxNbItemsToDisplayInGroup(totalNbGroupItems);
      sameGroupItems.splice(0, nbItemToKeep);

      this.makeAllItemsFoldable(sameGroupItems);
    }

    this.appendFoldButtonsToAllFoldableItemParents();
  }
}
