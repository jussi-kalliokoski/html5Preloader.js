VERSION := 0.61
INLINE_SOURCE := "html5Preloader.prototype.version=${VERSION};"
OUT := html5Preloader.${VERSION}
IN := js/html5Preloader.js js/rotary_extension.js

MINIFIER := uglifyjs
CAT := cat
ECHO := echo

all: ${OUT}.min.js

${OUT}.js: ${IN}
	${ECHO} ${INLINE_SOURCE} | ${CAT} $^ - > $@

%.min.js: %.js
	$(MINIFIER) $^ > $@

clean:
	rm ${OUT}.js ${OUT}.min.js -rf

.PHONY: clean all
