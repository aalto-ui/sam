$(document).ready(function () {
  let menuSelectors = {
    "#center": {
      "#ccc": "li",
      "#bbb": "li",
      "#forums": "li",
      "#hhh": "li",
      "#sss": "li",
      "#ppp": "li",
      "#jjj": "li",
      "#ggg": "li",
      "#rrr": "li"
    }
  };

  let mainInstance = AdaptiveWebMenus.fromSelectors(menuSelectors);

  console.log("AWM library initialised");
  console.log(mainInstance);
});
