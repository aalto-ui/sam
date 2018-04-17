
export class Utilities {

  // Return true if the given pathname match the end of the given link, false otherwise
  // If link is an empty string, it also returns false!
  static linkEndsWithPathname (link: string, pathname: string) {
    // Remove any leading or trailing slashes, quotes and whitespace
    const cleaningRegexp = /^(?:\/|\s|")*|(?:\/|\s|")*$/g;

    pathname = pathname.replace(cleaningRegexp, "");
    link = link.replace(cleaningRegexp, "");

    return link.length > 0
        && link.endsWith(pathname);
  }
}
