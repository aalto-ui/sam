import { Database } from "./Database";
import { ItemClicksAnalyser, ItemClicksAnalysis } from "./ItemClicksAnalyser";
import { PageVisitsAnalyser, PageVisitsAnalysis } from "./PageVisitsAnalyser";


export class DataAnalyser {
  // Analyser modules
  private readonly itemClicksAnalyser: ItemClicksAnalyser;
  private readonly pageVisitsAnalyser: PageVisitsAnalyser;

  constructor (database: Database) {
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
