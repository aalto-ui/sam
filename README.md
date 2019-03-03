# SAM
A JavaScript library which offers **Self-Adapting Web Menus**.

## Running SAM (for end-users)
SAM works by injecting custom JavaScript and CSS into an open webpage on the browser. We have currently tested it on Mozilla Firefox. To get started: 
1. Install an add-on for injecting JS/CSS. We use **Code Injector**: https://addons.mozilla.org/en-US/firefox/addon/codeinjector/
2. Add global rules (common for all URLs). Open the Code Injector add-on, and add new rules for the following: 
    1. Inject jQuery: 
        * URL pattern: `[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)`
        * Select the "Files" tab and paste the URL: https://code.jquery.com/jquery-3.3.1.min.js
    2. Inject AWM.css: 
        * URL pattern: `[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)`
        * Select the "CSS" tab and paste the entire text from https://github.com/aalto-ui/sam/blob/master/build/awm.css
    3. Inject AWM.js:
        * URL pattern: `[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)`
        * Select the "JavaScript" tab and paste the entire text from https://github.com/aalto-ui/sam/blob/master/build/awm.js
3. Add specific rules for targeted websites that you wish to adapt. Let's take Wikipedia as an example:
    * Add a new rule in Code Injector:
    * URL pattern: `en\.wikipedia\.org`
    * Select the "JavaScript" tab and paste the entire text from  https://github.com/aalto-ui/sam/blob/master/examples/wikipedia.org/main.js

      
## Building SAM (for developers)
If you want to build SAM on your machine, you need to:
1. Install `npm` on your machine (https://www.npmjs.com). If you use Homebrew, you can install it using: `brew install node`
2. Install `grunt-cli` using `npm`: `npm install -g grunt-cli`
3. Open terminal, and change your working directory to the `SAM` directory.
4. Install SAM:
  1. `npm install`
  2. `grunt`
5. The `build` folder will now contain all required files.
