# Adaptive web menus
**A Typescript library (compiled to ES6 Javascript) meant to offer automatically adapting web menus.**
This work is part of a research internship at Aalto University, UI group.

## How to use?
Using the AWM library is pretty straightforward:
* **Step 1:** Include (or inject) [jQuery](https://jquery.com/), the `awm.css` style sheet, and the `awm.js` library file, in the webpage sources.
* **Step 2:** Initialize an AWM instance using the exposed builder method(s), by passing it the right selectors. Make sure the selectors refer to *already existing DOM elements*, *e.g.* by waiting for the DOM tree to be loaded.
* **Step 3:** That's all!

**Setup examples:**
```javascript
  // Generic menu, group and item selectors
  AdaptiveWebMenus.fromSelectors(".menu", ".group", ".item");

  // Generic menu and item selectors
  // The DOM node of the single "virtual" group of each menu is considered to be the menu node
  AdaptiveWebMenus.fromSelectors(".menu", ".item");

  // Specific/detailed menu, group and item selectors
  AdaptiveWebMenus.fromSelectors({
    "#main-menu": {
      "#group-1": ".item",
      "#group-2": "a"
    },

    "#side-menu": $("#item1, #item2, #item3")
  });
```

TODO: add more detailed info


## How to build?
#### Dependencies
This library requires the following packages to be locally available:
* `typescript`
* `jquery` and `@types/jquery`
* `browserify`
* `browserify-shim`
* `uglify-es`

You can automatically install those dependencies by running `npm install` in the root directoy.

#### Building
The Makefile exposes the following commands:
* `make build` compiles Typescript sources to Javascript (in the `build/js` directory).
* `make browserify` resolves all imports to produce a single, standalone `awm.js` (in the `build/js` directory).
* `make uglify` compresses the standalone `awm.js` library.
* `make clean` removes any built file, by deleting the `build` directory.

The best option is to simply run `make` in the root directory, which will takes care of creating/populating the `build` directory!

**Note:** this Makefile is written to target a [*fish* shell](https://fishshell.com/) on Mac OSX — make sure to adapt it to your shell and OS if required!
