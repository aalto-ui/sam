.PHONY: build clean

# Main rule
all: compact

# Building rule
build:
	@echo "Building..."
	@mkdir -p build
	@cp -R -f src/example.html src/example_data.json build
	@node_modules/typescript/bin/tsc

# Resolve all imports (located in build folder) to make a single script
compact: build
	@echo "Compacting..."
	@node_modules/browserify/bin/cmd.js build/js/awm.js -o build/mod.js

# Cleaning rule
clean:
	rm -rf build
