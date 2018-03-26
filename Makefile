.PHONY: build clean

# Main rule
all: compact

# Building rule
build:
	@echo "Building..."
	@mkdir -p build
	@cp -R -f src/html src/css build
	@node_modules/typescript/bin/tsc

# Resolve all imports (located in build folder) to make a single script
compact: build
	@echo "Compacting..."
	@node_modules/browserify/bin/cmd.js build/js/awm.js -o build/js/mod.js

# Cleaning rule
clean:
	rm -rf build
