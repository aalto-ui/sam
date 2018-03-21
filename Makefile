.PHONY: build clean

# Main rule
all: build

# Building rule
build:
	@echo "Building..."
	@mkdir -p build
#	@cp -R -f src/css src/js src/img src/index.html build
	@node_modules/typescript/bin/tsc

# Cleaning rule
clean:
	rm -rf build
