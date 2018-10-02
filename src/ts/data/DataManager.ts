import { Database } from "./Database";
import { DataLogger } from "./DataLogger";
import { DataAnalyser } from "./DataAnalyser";
import { MenuManager } from "../elements/MenuManager";


export class DataManager {

  // ============================================================ PROPERTIES ===

  /**
   * Database where to store and load data.
   */
  readonly database: Database;

  /**
   * Data logger to listen for and log events into the database.
   */
  readonly logger: DataLogger;

  /**
   * Data analyser to get analyses of the database data.
   */
  readonly analyser: DataAnalyser;


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of data manager.
   *
   * @param menuManager The menu manager handling the library menus.
   */
  constructor (menuManager: MenuManager) {
    this.database = new Database();
    this.logger = new DataLogger(this.database, menuManager);
    this.analyser = new DataAnalyser(this.database);

    // DEBUG
    console.log("ITEM CLICK ANALYSIS", this.analyser.getItemClickAnalysis());
    console.log("PAGE VISITS ANALYSIS", this.analyser.getPageVisitsAnalysis());
  }


  // =============================================================== METHODS ===

}
