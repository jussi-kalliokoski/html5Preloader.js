# html5-preloader
# http://code.google.com/p/html5-preloader 
ver=0.51

all: full lite min
	mv output/*.js ./
	zip html5-preloader$(ver).zip *.js
	tar -cvf html5-preloader$(ver).tar *.js
	mv *.js output/
	mv *.zip output/
	mv *.tar output/
#	If someone knows a cooler way to do all this, please contribute :) It would be nice if there was a single line command to compress all the .js files in output/ into a .zip (and if such exists for tar too) in output/, without it including the directory itself.

full: js/html5-preloader.js js/rotary_extension.js
	cat js/html5-preloader.js js/rotary_extension.js > output/html5-preloader$(ver).full.js

min: js/html5-preloader.js js/rotary_extension.js
	echo "/* html5-preloader (min) http://code.google.com/p/html5-preloader */" > output/html5-preloader$(ver).min.js
	yui-compressor --type js js/html5-preloader.js >> output/html5-preloader$(ver).min.js
	yui-compressor --type js js/rotary_extension.js >> output/html5-preloader$(ver).min.js

lite: js/html5-preloader.js
	echo "/* html5-preloader (lite) http://code.google.com/p/html5-preloader */" > output/html5-preloader$(ver).lite.js
	yui-compressor --type js js/html5-preloader.js >> output/html5-preloader$(ver).lite.js

clean:
	rm output/*
