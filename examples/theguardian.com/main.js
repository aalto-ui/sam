$(document).ready(function () {
  let menuSelectors = {
    ".subnav:eq(0)": {
      ".subnav__list": "li"
    }
  };

  let mainInstance = AdaptiveWebMenus.fromSelectors(menuSelectors);

  console.log("AWM library initialised");
  console.log(mainInstance);
});
