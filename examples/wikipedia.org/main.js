$(document).ready(function () {
  let menuSelectors = {
    "#mw-panel": {
      "#p-navigation": "li",
      "#p-interaction": "li",
      "#p-tb": "li",
      "#p-coll-print_export": "li",
      "#p-wikibase-otherprojects": "li",
      "#p-lang": "li"
    }
  };

  let mainInstance = AdaptiveWebMenus.fromMenuSelectors(menuSelectors);

  console.log("AWM library initialised");
  console.log(mainInstance);
});
