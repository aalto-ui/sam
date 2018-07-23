import { Database } from "./Database";
import { DataLogger } from "./DataLogger";
import { DataAnalyser } from "./DataAnalyser";
import { Menu } from "../elements/Menu";


export class DataManager {
  // Database, logger and analyser
  readonly database: Database;
  readonly logger: DataLogger;
  readonly analyser: DataAnalyser;

  constructor (menus: Menu[]) {
    this.database = new Database();
    this.logger = new DataLogger(this.database, menus);
    this.analyser = new DataAnalyser(this.database);

    // DEBUG
    console.log("ITEM CLICK ANALYSIS", this.analyser.getItemClickAnalysis());
    console.log("PAGE VISITS ANALYSIS", this.analyser.getPageVisitsAnalysis());
  }
}
