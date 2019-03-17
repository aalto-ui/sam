# SAM [![Build Status](https://travis-ci.org/aalto-ui/sam.svg?branch=master)](https://travis-ci.org/aalto-ui/sam)

SAM is a Javascript library which offers **Self-Adapting Menus** for websites.

**[⬇️ Download SAM](https://aalto-ui.github.io/sam/build/sam.zip)** (last build, compressed)

**[ℹ️ Read the full documentation](https://aalto-ui.github.io/sam/docs/)**

SAM can turn almost any kind of static webpage structure into a custom adaptive menu, in a few lines of code only. It comes with the following features:

* **Abstraction of webpage menus**, easily built using JQuery selectors.
* **Continuous logging of user interactions**, entirely local to the web browser of each user.
* **Popular adaptation techniques**, split between target policies (_what_ to adapt in a menu) and adaptation styles (_how_ to adapt the target items).

You can find more details about the framework in the following [IUI19 paper](https://dl.acm.org/citation.cfm?id=3308705).



## Running SAM (for end-users)
Since SAM is entirely client-side, it can be _injected_ in any webpage. This process allows to adapt the menu of many websites, even though they were not built using SAM.

Several browser extensions allow you to inject custom JavaScript and CSS into the webpages you visit. We currently use **Mozilla Firefox** with **[Code Injector](https://addons.mozilla.org/en-US/firefox/addon/codeinjector/)**. The tutorial below assumes you are using Code Injector—but you can adapt it to make it work with any similar browser extension.

1. Open the Code Injector panel (click the icon).
2. **Create a global rule** (common to all URLs) **to inject SAM on every website you visit**. If you prefer, you can also use more restrictive rules to only inject SAM on certain websites.
    1. **Inject jQuery:**
        * URL pattern: `.*`
        * In the _Files_ tab, add the following URL: https://code.jquery.com/jquery-3.3.1.min.js
    2. **Inject SAM:**
        * URL pattern: `.*`
        * In the _CSS_ tab, paste the content of [`sam.css`](https://aalto-ui.github.io/sam/build/sam.css)
        * In the _JavaScript_ tab, paste the content of [`sam.min.js`](https://aalto-ui.github.io/sam/build/sam.min.js)
3. **Add specific rules to initialise SAM on each website containing menus you wish to adapt**. Let's take Wikipedia as an example, and add a new rule in Code Injector:
    * URL pattern: `\.wikipedia\.org`
    * In the _JavaScript_ tab, paste [this initialisation script](examples/wikipedia.org/main.js) (which targets the main menu of Wikipedia).

      

## Building SAM (for developers)
SAM is written in [TypeScript](https://www.TypeScriptlang.org/), a typed language which can be transpiled to plain JavaScript. It relies on a few dependencies required to build it, and on a single runtime dependency (jQuery—which must be loaded _before_ SAM on any webpage to adapt).

If you want to build SAM on your machine, you must start by installing all the dependencies using [npm](https://www.npmjs.com/). It is shipped along with Node.js, that you can install with one of the following ways:
* Using [nvm](https://github.com/creationix/nvm) (Unix & OSX): `nvm install node`
* Using [Homebrew](https://brew.sh/) (OSX): `brew install node`
* [See other alternatives on npmjs.com](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

Once this is done, **open a terminal and run the following commands**:
1. `git clone https://github.com/aalto-ui/sam.git` to clone this repository.
2. `cd sam` to change you working directory to the clone you just made.
3. `npm install -g grunt-cli` to install the CLI of [Grunt](https://gruntjs.com/), the build system we use.
3. `npm install` to install all the other dependencies (listed in [`package.json`](package.json)).
4. `grunt` to finally build SAM.

The new `build` folder will contain your own build of SAM. You can also generate your own documentation by running `grunt doc`.

**Note on the `build/lib` directory:** this directory contains each TypeScript source file transpiled to JavaScript, along with TypeScript Declaration files (which provide type information). You can probably ignore this directory, except if you wish to build a web application in TypeScript with SAM as a npm dependency.



## Extending SAM (for researchers)
In SAM, **each adaptation technique is a combination of a policy and a style**. While the code of SAM can be extended in various ways, one of the most interesting kind of extension is the addition of a new policy or a new style:

* A **policy** is a metric of importance for all items (or groups of items). It must assign a score to each item (or group of item), and sort them accordingly. It reflects _what_ to adapt in the menus (e.g. the most clicked items).
* A **technique** is a certain way of updating the webpage menus to adapt them. It must modify the DOM in accordance with the output of the policy, and be able to cancel the changes at any time. It reflects _how_ to adapt the menus (e.g. highlight the top-3 items).

We decided to make adaptation techniques modular in order to encourage researchers to re-use existing pieces of code, and spend more time on trying out new ideas (instead of constantly re-implementing features such as user logging and common metrics). In addition, SAM already provides some popular [policies](src/ts/adaptations/policies) and [styles](src/ts/adaptations/styles).


### Adding a new target policy
In order to add a new target policy, you must first create a new class which implements the [`TargetPolicy`](https://aalto-ui.github.io/sam/docs/interfaces/adaptation.targetpolicy.html) interface, and give it a unique name.

For more convenience, you may want to extend the [`DefaultTargetPolicy`](https://aalto-ui.github.io/sam/docs/classes/adaptation.defaulttargetpolicy.html) class instead. It provides a default implementation of all methods of the interface but [`getSortedItemsWithScores`](https://aalto-ui.github.io/sam/docs/interfaces/adaptation.targetpolicy.html#getsorteditemswithscores), that must return a sorted array of objects containing an item and its score, and that you must implement yourself.

Once your new class fully implements the interface, you must add an instance of your policy in the [`AVAILABLE_POLICIES`](https://aalto-ui.github.io/sam/docs/modules/adaptation.html#available_policies) array, and rebuild SAM. It will be available in the [adaptation manager](https://aalto-ui.github.io/sam/docs/classes/adaptation.adaptationmanager.html) by using the name you gave it.


**Note on default implementations:** if your policy belongs to a specific kind of metric, you may want to check if there is an even **more specific abstract class** to extend. For instance, all the policies provided by SAM which sort items according to a score related to the page they link to extend the [`LinkedPageScorePolicy`](https://aalto-ui.github.io/sam/docs/classes/adaptation.linkedpagescorepolicy.html) class instead, which does almost all the work!


### Adding a new adaptation style
In order to add a new adaptation style, you must first create a new class which implements the [`AdaptationStyle`](https://aalto-ui.github.io/sam/docs/interfaces/adaptation.adaptationstyle.html) interface, and give it a unique name.

Remember that the scores and/or the order of the items (or group of items) provided by the policy represent the importance of the different items (or groups of items) for the user (i.e. what the adapted menu should highlight).

Once your new class fully implements the interface, you must add an instance of your style in the [`AVAILABLE_STYLES`](https://aalto-ui.github.io/sam/docs/modules/adaptation.html#available_styles) array, and rebuild SAM. It will be available in the [adaptation manager](https://aalto-ui.github.io/sam/docs/classes/adaptation.adaptationmanager.html) by using the name you gave it.


**Note on composite styles:** another way of making it simpler to create new adaptation techniques lies in the notion of _style composition_: two or more styles can be chained inside a new style (which basically calls the `apply` and `cancel` methods of other styles in the right order). This kind of adaptation style is called a **composite style**. SAM provides [some examples of composite styles](https://github.com/aalto-ui/sam/tree/master/src/ts/adaptations/styles/composites).