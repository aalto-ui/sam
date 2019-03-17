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
          "build/sam.js": "build/lib/sam.js"
        },

        options: {
          // This transform is needed to assume jQuery (as $) is available
          // in the global namespace, not to package it with the library.
          // Note: it is also declared in package.json (required?)
          transform: ["browserify-shim"],
          browserifyOptions: {
            "--standalone": "sam"
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
          'build/sam.min.js': ['build/sam.js']
        }
      },

      options: {
        compress: true
      }
    },

    // Making documentation task
    // It generates the whole documentation of the library from the sources.
    typedoc: {
  		build: {
  			options: {
  				module: "commonjs",
  				out: "./doc",
  				name: "Adaptive Web Menus",
          target: "ES6",
          mode: "modules",
          readme: "./DOCUMENTATION.md",
          media: "./misc/media",
          exclude: ["**/src/ts/index.ts", "**/src/ts/sam.ts"]
  			},

        src: ["./src/ts/**/*.ts"]
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
  grunt.loadNpmTasks("grunt-typedoc");

  /***************************************************************************/
  /* Task registering
  /***************************************************************************/

  grunt.registerTask("clean", "Remove the 'build' directory, as well as temporary/caching directories.", "exec:clean");
  grunt.registerTask("build", "Compile the Typescript sources and copy other useful files into a 'build' directory.", ["ts", "exec:copyCSS"]);
  grunt.registerTask("doc", "Generates the documentation of the library.", "typedoc");

  // The default task should build the whole library,
  // and create both a typed library and a standalone script for webpages.
  grunt.registerTask("default", ["build", "browserify", "uglify"]);
};
