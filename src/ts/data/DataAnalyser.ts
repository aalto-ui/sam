import { Database } from "./Database";
import { ItemClicksAnalyser, ItemClicksAnalysis } from "./ItemClicksAnalyser";
import { PageVisitsAnalyser, PageVisitsAnalysis } from "./PageVisitsAnalyser";


export class DataAnalyser {

  /*************************************************************** PROPERTIES */

  // Analyser modules
  private readonly itemClicksAnalyser: ItemClicksAnalyser;
  private readonly pageVisitsAnalyser: PageVisitsAnalyser;


  /************************************************************** CONSTRUCTOR */

  constructor (database: Database) {
    this.itemClicksAnalyser = new ItemClicksAnalyser(database);
    this.pageVisitsAnalyser = new PageVisitsAnalyser(database);
  }


  /****************************************************************** METHODS */

  getItemClickAnalysis (): ItemClicksAnalysis {
    return this.itemClicksAnalyser.getAnalysis();
  }

  getPageVisitsAnalysis (): PageVisitsAnalysis {
    return this.pageVisitsAnalyser.getAnalysis();
  }
}
