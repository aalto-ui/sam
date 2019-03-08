$(document).ready(function () {
  let selectors = {
    "#mw-panel": {
      "#p-navigation": "li",
      "#p-interaction": "li",
      "#p-tb": "li",
      "#p-coll-print_export": "li",
      "#p-wikibase-otherprojects": "li",
      "#p-lang": "li"
    }
  };

  let sam = SAM.fromSelectors(selectors);

  console.log("SAM has been initialised.");
  console.log(sam);
});
