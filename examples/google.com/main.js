$(document).ready(function () {
  let menuSelectors = {
    "#hdtb-msb": ".hdtb-mitem"
  };

  let mainInstance = AdaptiveWebMenus.fromSelectors(menuSelectors);

  console.log("AWM library initialised");
  console.log(mainInstance);
});
