# Adaptive web menus
**A Typescript library (compiled to ES6 Javascript) meant to offer automatically adapting web menus.**

This work is part of a research internship at Aalto University, UI group.

## How to use?
Using the AWM library is pretty straightforward:
* **Step 1:** Include (or inject) [jQuery](https://jquery.com/) and the `awm.js` library file in the webpage sources.
* **Step 2:** Initialize an AWM instance using the exposed builder method(s), by passing it the right selectors. Make sure the selectors refer to *already existing DOM elements*, e.g. by waiting for the DOM tree to be loaded.
* **Step 3:** That's all!

**Setup example:**
```javascript
  let menuSelectors = {
    "#main-menu": {
      ".item-group": ".item"
    }
  };

  AdaptiveWebMenus.fromMenuSelectors(menuSelectors);
```

TODO: add more detailed info


## How to build?
#### Dependencies
This library requires the following packages:
* `typescript`
* `jquery` and `@types/jquery`
* `browserify`
* `ulify-es`

You can automatically install those dependencies by running `npm install` in the root directoy.

#### Building
The Makefile exposes the following commands:
* `make build` compiles Typescript sources to Javascript (in the `build/js` directory).
* `make browserify` resolves all imports to produce a single, standalone `awm.js` (in the `build/js` directory).
* `make uglify` compresses the standalone `awm.js` library.
* `make clean` removes any built file, by deleting the `build` directory.

The best option is to simply run `make` in the root directory, which will takes care of creating/populating the `build` directory!
