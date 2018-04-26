
export class Utilities {

  // Return true if the given pathname match the pathname of the given link, false otherwise
  static linkHasPathname (link: string, pathname: string) {
    let linkElement = document.createElement("a");
    linkElement.href = link;

    return linkElement.pathname === pathname;
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
