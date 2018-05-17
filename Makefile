# Aliases to the main commands used thereafter
TSC = node_modules/typescript/bin/tsc
BROWSERIFY = node_modules/browserify/bin/cmd.js
UGLIFY = node_modules/uglify-es/bin/uglifyjs


.PHONY: init build browserify uglify clean

# Main rule
all: uglify


# Setup rule (install dependencies)
init:
	@echo "Initializing..."
	@npm install


# Compile Typescript sources to Javascript + type declarations
build:
	@echo "Compiling..."
	@mkdir -p build build/lib
	@cp -R -f src/css/* build
	@$(TSC)

# Resolve all imports to make a single browser-ready script
browserify: build
	@echo "Browserifying..."
	@$(BROWSERIFY) build/lib/awm.js --standalone awm -t [ browserify-shim ] -o build/awm.js

# Uglify the browser-ready script (shorter code/better perfs)
uglify: browserify
	@echo "Uglifying..."
	@$(UGLIFY) build/awm.js --compress -o build/awm.min.js


clean:
	rm -rf build
