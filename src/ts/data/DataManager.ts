import { Database } from "./Database";
import { DataLogger } from "./DataLogger";
import { DataAnalyser } from "./DataAnalyser";
import { MenuManager } from "../elements/MenuManager";


export class DataManager {
  // Database, logger and analyser
  readonly database: Database;
  readonly logger: DataLogger;
  readonly analyser: DataAnalyser;

  constructor (menuManager: MenuManager) {
    this.database = new Database();
    this.logger = new DataLogger(this.database, menuManager);
    this.analyser = new DataAnalyser(this.database);

    // DEBUG
    console.log("ITEM CLICK ANALYSIS", this.analyser.getItemClickAnalysis());
    console.log("PAGE VISITS ANALYSIS", this.analyser.getPageVisitsAnalysis());
  }
}
