import { Database } from "./Database";
import { ItemClicksAnalyser, ItemClicksAnalysis } from "./ItemClicksAnalyser";
import { PageVisitsAnalyser, PageVisitsAnalysis } from "./PageVisitsAnalyser";


export class DataAnalyser {
  // The database to analyse
  private database: Database;

  // Analyser modules
  private itemClicksAnalyser: ItemClicksAnalyser;
  private pageVisitsAnalyser: PageVisitsAnalyser;

  constructor (database: Database) {
    this.database = database;

    this.itemClicksAnalyser = new ItemClicksAnalyser(database);
    this.pageVisitsAnalyser = new PageVisitsAnalyser(database);
  }

  getItemClickAnalysis (): ItemClicksAnalysis {
    return this.itemClicksAnalyser.getAnalysis();
  }

  getPageVisitsAnalysis (): PageVisitsAnalysis {
    return this.pageVisitsAnalyser.getAnalysis();
  }
}
