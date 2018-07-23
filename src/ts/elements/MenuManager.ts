import { Menu } from "./Menu";
import { Item } from "./Item";
import { ItemGroup } from "./ItemGroup";


export class MenuManager {
  // List of adaptive menus
  private readonly menus: Menu[];

  constructor (menus: Menu[] = []) {
    this.menus = menus;
  }

  addMenu (menu: Menu) {
    this.menus.push(menu);
  }

  removeMenu (menuID: string): Menu | null {
    let removalIndex = this.menus.findIndex((menu) => {
      return menu.id === menuID;
    });

    if (removalIndex === -1) {
      return null;
    }

    return this.menus.splice(removalIndex, 1)[0];
  }


  getAllItems (): Item[] {
    return Menu.getAllMenusItems(this.menus);
  }

  getNbItems (): number {
    return this.getAllItems().length;
  }

  getAllGroups (): ItemGroup[] {
    return Menu.getAllMenusGroups(this.menus);
  }

  getNbGroups (): number {
    return this.getAllGroups().length;
  }

  getAllMenus (): Menu[] {
    return this.menus;
  }

  getNbMenus (): number {
    return this.getAllMenus().length;
  }
}
