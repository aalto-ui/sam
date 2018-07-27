export type PageID = string;


export class Utilities {

  /*********************************************************** STATIC METHODS */


  /****************************************************************************/
  /* Page ID
  /****************************************************************************/

  /**
   * Return the page ID of the current page.
   *
   * @return The ID of the current page.
   */
  static getCurrentPageID (): PageID {
    return window.location.hostname
      .concat(window.location.pathname);
  }

  /**
   * Return the page ID of the page pointed by the given link.
   *
   * @param  link The link pointing to the page.
   * @return      The ID of the pointed page.
   */
  private static getLinkedPageID (link: string): PageID {
    let linkElement = document.createElement("a");
    linkElement.href = link;

    return linkElement.hostname
      .concat(linkElement.pathname);
  }

  /**
   * Test whether the page pointed by the given link matches the given page ID.
   *
   * @param  link   The link pointing to a page.
   * @param  pageID The page ID to compare.
   * @return        `true` if the page IDs match, `false` otherwise.
   */
  static isLinkMatchingPageID (link: string, pageID: PageID) {
    return Utilities.getLinkedPageID(link) === pageID;
  }


  /****************************************************************************/
  /* Local storage
  /****************************************************************************/

  /**
   * Test whether the local storage is available.
   *
   * @return `true` if it is available, `false` otherwise.
   */
  static isLocalStorageAvailable (): boolean {
    if (! window.localStorage) {
      console.error("Error: local storage is not available!");
      return false;
    }

    return true;
  }
}
