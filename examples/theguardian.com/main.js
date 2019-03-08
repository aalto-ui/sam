$(document).ready(function () {
  let sam = SAM.fromSelectors(".subnav:eq(0)", ".subnav__list", "li");

  console.log("SAM has been initialised.");
  console.log(sam);
});
