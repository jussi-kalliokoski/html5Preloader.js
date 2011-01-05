# html5Preloader.js
# MIT License, see http://github.com/jussi-kalliokoski/html5Preloader.js
ver=0.54

all: min

min: js/html5Preloader.js js/rotary_extension.js
	echo "/* MIT License, see http://github.com/jussi-kalliokoski/html5Preloader.js */" > output/html5Preloader.$(ver).min.js
	yui-compressor --type js js/html5Preloader.js >> output/html5Preloader.$(ver).min.js
	yui-compressor --type js js/rotary_extension.js >> output/html5Preloader.$(ver).min.js
	echo "html5Preloader.prototype.version=$(ver);" >> output/html5Preloader.$(ver).min.js

clean:
	rm output/*
