# Adaptive web menus
**A Typescript library (compiled to ES6 Javascript) meant to offer automatically adapting web menus.**

This work is part of a research internship at Aalto University, UI group.

### How to use?
TODO

### How to compile?
This library requires the following packages, e.g. installed using `npm`:
* `typescript`
* `jquery` and `@types/jquery`
* `browserify`

Then, simply use the provided Makefile commands:
* `make build` compiles Typescript sources to Javascript (in the `build/js` folder).
* `make compact` resolves all imports to produce a single `mod.js` (in the `build` folder).
* `make clean` removes all built files.

The best option is to simply run `make`, which runs both `build`and `compact` commands.
