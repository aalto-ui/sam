$(document).ready(function () {
  // Setup for test page<1-6>.html
  let menuSelectors = {
    "#main-menu": {
      ".menu-group": "li"
    }
  };

  let mainInstance = AdaptiveWebMenus.fromMenuSelectors(menuSelectors);

  console.log("AWM library initialised");
  console.log(mainInstance);
});
