export class Utilities {

  static getCurrentPageID (): string {
    return window.location.hostname
      .concat(window.location.pathname);
  }

  private static getLinkedPageID (link: string): string {
    let linkElement = document.createElement("a");
    linkElement.href = link;

    return linkElement.hostname
      .concat(linkElement.pathname);
  }


  static isLinkMatchingPageID (link: string, pageID: string) {
    return Utilities.getLinkedPageID(link) === pageID;
  }

  // If the local storage is available, return true
  // Otherwise, print an error message in the console, and return false
  static isLocalStorageAvailable (): boolean {
    if (! window.localStorage) {
      console.error("Error: local storage is not available!");
      return false;
    }

    return true;
  }
}
