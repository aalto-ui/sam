import AdaptiveWebMenus from "./AdaptiveWebMenus";

window["AdaptiveWebMenus"] = AdaptiveWebMenus;

/*
import * as $ from "jquery";

$(document).ready(function () {
  // DEBUG: setup for page<1-6>.html

  let menuSelectors = {
    "#main-menu": {
      ".menu-group": "li"
    }
  };

  window["awm"] = AdaptiveWebMenus.fromMenuSelectors(menuSelectors);
  console.log("AWM library initialised");
  console.log(window["awm"]);


  // DEBUG: setup for en.wikipedia.org
/*
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

  window["awm"] = AdaptiveWebMenus.fromMenuSelectors(menuSelectors);
  console.log("AWM library initialised");
  console.log(window["awm"]);
*/

  // DEBUG: setup for inside.aalto.fi
/*
  setTimeout(function () {
    let menuSelectors = {
      ".meganavi-content": {
        "#Tools-Peopleandcontacts + ul": "li",
        "#Tools-ITServices + ul": "li",
        "#Tools-HRandfinance + ul": "li",
        "[id^=Tools-Logos] + ul": "li",
        "#Tools-Researchandeducation + ul": "li",
        "#Tools-Facilities + ul": "li",
        "#Tools-Collaborationandfilesharing + ul": "li",
        "#Tools-Other + ul": "li"
      }
    };

    window["awm"] = AdaptiveWebMenus.fromMenuSelectors(menuSelectors);
    console.log("AWM library initialised");
    console.log(window["awm"]);
  }, 2000);
*/

  // DEBUG: setup for google.com (search results)
/*
  let menuSelectors = {
    "#hdtb-msb": ".hdtb-mitem"
  };

  window["awm"] = AdaptiveWebMenus.fromMenuSelectors(menuSelectors);
  console.log("AWM library initialised");
  console.log(window["awm"]);
*/

// DEBUG: setup for amazon.com (all categories)
/*
  let menuSelectors = {
    ".fsdContainer": {
      ".fsdDeptCol": "a"
    }
  };

  window["awm"] = AdaptiveWebMenus.fromMenuSelectors(menuSelectors);
  console.log("AWM library initialised");
  console.log(window["awm"]);
*/

// DEBUG: setup for craiglist.com (main categories)
/*
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

  window["awm"] = AdaptiveWebMenus.fromMenuSelectors(menuSelectors);
  console.log("AWM library initialised");
  console.log(window["awm"]);
*/

// DEBUG: setup for nytimes.com
/*
setTimeout(function () {
  let menuSelectors = {
    "#mini-navigation": {
      ".mini-navigation-menu": "li"
    },

    "#navigation": {
      ".section:eq(0)": "li",
      ".section:eq(1)": "li",
      ".section:eq(2)": "li",
      ".section:eq(3)": "li",
      ".section:eq(4)": "li",
      ".section:eq(5)": "li"
    }
  };

  window["awm"] = AdaptiveWebMenus.fromMenuSelectors(menuSelectors);
  console.log("AWM library initialised");
  console.log(window["awm"]);

  window["awm"].applyAdaptation();
}, 500);
*/

// DEBUG: setup for theguardian.com

/*
  let menuSelectors = {
    ".subnav": {
      ".subnav__list": "li"
    }
  };

  window["awm"] = AdaptiveWebMenus.fromMenuSelectors(menuSelectors);
  console.log("AWM library initialised");
  console.log(window["awm"]);
*/
/*
});
*/
