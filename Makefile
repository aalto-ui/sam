.PHONY: init build browserify uglify clean

# Main rule
all: uglify

# Setup rule (install dependencies)
init:
	@echo "Initializing..."
	@npm install

# Transpile Typescript sources to Javascript
build:
	@echo "Building..."
	@mkdir -p build
	@cp -R -f src/html src/css src/js build
	@node_modules/typescript/bin/tsc

# Resolve all imports (located in the build folder) to make a single script
browserify: build
	@echo "Browserifying..."
	@node_modules/browserify/bin/cmd.js build/js/awm.js --standalone awm -t [ browserify-shim ] -o build/js/awm.js

# Uglify the output for shorter code/better performances
uglify: browserify
	@echo "Uglifying..."
	@node_modules/uglify-es/bin/uglifyjs build/js/awm.js --compress -o build/js/awm.min.js

# Cleaning rule
clean:
	rm -rf build
