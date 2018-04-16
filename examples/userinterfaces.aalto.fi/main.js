$(document).ready(function () {
  let menuSelectors = {
    "#menu-main": "li"
  };

  let mainInstance = AdaptiveWebMenus.fromMenuSelectors(menuSelectors);

  console.log("AWM library initialised");
  console.log(mainInstance);
});
