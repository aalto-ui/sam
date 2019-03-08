$(document).ready(function () {
  let selectors = {
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

  let sam = SAM.fromSelectors(selectors);

  console.log("SAM has been initialised.");
  console.log(sam);
});
