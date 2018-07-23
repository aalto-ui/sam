module.exports = function (grunt) {

  /***************************************************************************/
  /* Configuration of Grunt & the tasks
  /***************************************************************************/

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    // Command lines instruction tasks
    // Those instructions can be used at various points in the building process,
    // or for additional available tasks (e.g. cleaning task).
    exec: {
      npmInstall: "npm install",
      clean: "rm -Rf build .tscache",
      copyCSS: "cp -Rf src/css/* build"
    },

    // Typescript compiler task
    // It maps each Typescript souce file (from src/ts) into
    // a compiled Javascript file (to build/lib), along with type definitions.
    ts: {
      default : {
        tsconfig: "./tsconfig.json"
      }
    },

    // Browserifying task
    // It turns the multiple Javascript files which tsc compiler outputs into
    // a single, standalone file ready to be linked into a webpage.
    browserify: {
      dist: {
        files: {
          "build/awm.js": "build/lib/awm.js"
        },

        options: {
          // This transform is needed to assume jQuery (as $) is available
          // in the global namespace, not to package it with the library.
          // Note: it is also declared in package.json (required?)
          transform: ["browserify-shim"],
          browserifyOptions: {
            "--standalone": "awm"
          }
        }
      }
    },

    // Uglifying task
    // It minimizes the standalone Javascript (ES6) file
    // which has been produced by the browserify task.
    uglify: {
      default: {
        files: {
          'build/awm.min.js': ['build/awm.js']
        }
      },

      options: {
        compress: true
      }
    }
  });


  /***************************************************************************/
  /* npm plugin loading
  /***************************************************************************/

  grunt.loadNpmTasks("grunt-exec");
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-contrib-uglify-es");
  grunt.loadNpmTasks("grunt-browserify");


  /***************************************************************************/
  /* Task registering
  /***************************************************************************/

  grunt.registerTask("init", "Install all dependencies required to build AWM.", "exec:npmInstall");
  grunt.registerTask("clean", "Remove the 'build' directory, as well as temporary/caching directories.", "exec:clean");
  grunt.registerTask("build", "Compile the Typescript sources and copy other useful files into a 'build' directory.", ["ts", "exec:copyCSS"])

  // The default task should build the whole library,
  // and create both a typed library and a standalone script for webpages.
  grunt.registerTask("default", ["build", "browserify", "uglify"]);
};
