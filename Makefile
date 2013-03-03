MODULES_DIR ?= node_modules
PACKAGE ?= package.json
DST ?= html5Preloader.js
SRC ?= src/index.js
SOURCES ?= src/*.js
IMPORTER ?= ./node_modules/importer/js/cmd.js

test: test/src/$(DST)
	mkdir -p test/src
	grunt test

$(MODULES_DIR): $(PACKAGE)
	npm install

$(IMPORTER): $(MODULES_DIR)

%$(DST): $(IMPORTER) $(SOURCES)
	$(IMPORTER) $(SRC) $@

.PHONY: all clean test
