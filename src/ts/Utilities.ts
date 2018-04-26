
export class Utilities {

  // Return true if the given pathname match the pathname of the given link, false otherwise
  static linkHasPathname (link: string, pathname: string) {
    let linkElement = document.createElement("a");
    linkElement.href = link;

    return linkElement.pathname === pathname;
  }


    return link.length > 0
        && link.endsWith(pathname);
  }
}
