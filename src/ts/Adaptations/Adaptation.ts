import { Menu } from "../Menus/Menu";

// Generic parent class for a menu adaptation
// Any adaptation technique should extend this interface
export abstract class Adaptation {

  // Apply the adaptation to a menu, using given data if required
  // This method must be extended to appropriately adapt the given menu!
  static apply (menu: Menu, data: object) { }
}
