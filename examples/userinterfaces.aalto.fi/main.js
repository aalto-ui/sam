$(document).ready(function () {
  let menuSelectors = {
    "#menu-main": "li"
  };

  let mainInstance = AdaptiveWebMenus.fromSelectors(menuSelectors);

  console.log("AWM library initialised");
  console.log(mainInstance);
});
