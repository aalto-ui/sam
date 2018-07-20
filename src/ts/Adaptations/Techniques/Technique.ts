import { Menu } from "../../elements/Menu";
import { Policy } from "../policies/Policy";
import { DataAnalyser } from "../../data/DataAnalyser";
import { Database } from "../../data/Database";


// Interface of a menu adaptation
// Any adaptation technique must implement this interface
// It has a type parameter P, which represent the type of policies it can accept
export interface Technique<P extends Policy> {
  // Represents the technique name, and must be unique among all techniques
  readonly name: string;

  // Reset the page menus, by removing any changes made by this adaptation
  reset (): void;

  // Adapt the page menus, using the given data analyser and database if required
  apply (menus: Menu[], policy?: P, analyser?: DataAnalyser, database?: Database): void;
}
