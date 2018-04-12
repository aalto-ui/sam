.PHONY: build clean

# Main rule
all: package_test

# Setup rule (install dependencies)
init:
	@echo "Initializing..."
	@npm install typescript
	@npm install jquery
	@npm install @types/jquery
	@npm install browserify

# Building rule
build:
	@echo "Building..."
	@mkdir -p build
	@cp -R -f src/html src/css src/js build
	@node_modules/typescript/bin/tsc

# Resolve all imports (located in build folder) to make a single script
browserify: build
	@echo "Browserifying..."
	@node_modules/browserify/bin/cmd.js build/js/main.js -o build/js/mod.js

# Make a standalone test directory (ready to be shared)
package_test: build browserify
	@echo "Packaging..."
	@mkdir -p build/awm-test
	@cp -R -f build/html build/css build/js build/awm-test
	@cp -f build/js/mod.js build/awm-test/js

# Cleaning rule
clean:
	rm -rf build
