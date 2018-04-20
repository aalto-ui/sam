import { Database } from "./Database";
import { Utilities } from "../Utilities";
import { ItemClicksAnalyser, ItemClicksAnalysis } from "./ItemClicksAnalyser";
import { PageVisitsAnalyser, PageVisitsAnalysis } from "./PageVisitsAnalyser";


// Generic type of an analysis, returned by an anlyser module
export interface Analysis { };


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
