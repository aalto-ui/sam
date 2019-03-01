/** @module user-data */

import { Database } from "./Database";
import { ItemClicksAnalyser, ItemClicksAnalysis } from "./ItemClicksAnalyser";
import { PageVisitsAnalyser, PageVisitsAnalysis } from "./PageVisitsAnalyser";


export class DataAnalyser {

  // ============================================================ PROPERTIES ===

  /**
   * Item clicks analyser module.
   */
  private readonly itemClicksAnalyser: ItemClicksAnalyser;

  /**
   * Page visits analyser module.
   */
  private readonly pageVisitsAnalyser: PageVisitsAnalyser;


  // =========================================================== CONSTRUCTOR ===

  /**
   * Create a new instance of data analyser.
   *
   * @param database The database where to fetch data to analyse.
   */
  constructor (database: Database) {
    this.itemClicksAnalyser = new ItemClicksAnalyser(database);
    this.pageVisitsAnalyser = new PageVisitsAnalyser(database);
  }


  // =============================================================== METHODS ===

  /**
   * Return an item clicks analysis.
   *
   * @return An up-to-date item clicks analysis.
   */
  getItemClickAnalysis (): ItemClicksAnalysis {
    return this.itemClicksAnalyser.getAnalysis();
  }

  /**
   * Return a page visits analysis.
   *
   * @return An up-to-date page visits analysis.
   */
  getPageVisitsAnalysis (): PageVisitsAnalysis {
    return this.pageVisitsAnalyser.getAnalysis();
  }
}
