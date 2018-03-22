.PHONY: build clean

# Main rule
all: compact

# Building rule
build:
	@echo "Building..."
	@mkdir -p build
#	@cp -R -f src/css src/js src/img src/index.html build
	@node_modules/typescript/bin/tsc

# Resolve all imports (located in build folder) to make a single script
compact: build
	@echo "Compacting..."
	node_modules/browserify/bin/cmd.js $(shell find build/js -name "*.js") -o build/mod.js

# Cleaning rule
clean:
	rm -rf build
