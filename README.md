#html5Preloader

With the growing use of HTML5 and it taking over the browser game scene, developers need an easy API to preload their resources on to the browser. html5-preloader aims to offer this, and in a compact, yet customizable way. html5-preloader supports almost all of the data types out there, from mp4 to XML, and with flexible fallback support.

## Why Choose H5P?

* It's lightweight, easy to use and flexible.
* You won't have to worry about browser differencies on file loading, the library does it for you.
* No more errors because some load wasn't finished yet.

## Features

* Supports all the major resources: audio, image, video, document/xml
* Versatile input syntax, you can add files just with ``` addFiles('file1.abc', 'file2.abc', ...) ``` syntax or you can use ``` 'myIdentifier*:file1.abc' ``` to specify an identifier for the file (for fetching the file afterwards, if necessary) and you can combine these with the flexible alternate filepath syntax, ie. ``` 'myFile*:file1.abc||alternate1.abc||alternate2.abc' ``` to provide fallbacks where necessary.
* Supports all the major MODERN browsers: Chrome/Chromium 6+, IE9+, Opera 10.6+, FF 3.6+, Safari 5+ (if you're not designing a web application that would require one of these browsers, you won't trigger code that isn't supported by the unmentioned browsers anyway, so basically this library supports all browsers)
* Advanced error handling and support for custom error handling via a single ``` error ```event.
* Easily detect when all files have been loaded with an event titled ``` finish ```
* Use loaded files via ``` .getFile(identifier) ``` function. You can fetch all loaded files by omitting an identifier.
* Graphical feedback extensions are easy to build, downloads include one such extension that draws a basic rotating loader, on the specified 2D context of a canvas.
* Secure: Minimum conflict with other js libraries. Robust coding makes sure all data remains unaltered by third parties (provided you make your html5Preloader instance a private variable as well)

## Examples

### Initializing

First, include the script to your page (you can download the latest stable version from the downloads). Next, you need to create an instance of the html5-preloader:

```javascript

var myLoader = html5Preloader();

```

#### File adding

Now you should probably add some files to load, that's pretty straightforward to do:

```javascript

// You can call the .addFiles() function

// To shorten load times, you should always offer the .mp3 as a last alternative.
myLoader.addFiles('file1', 'mysound*:sound.ogg||sound.mp3'); 

// Or you can always add the files on construct, like this:
myLoader = html5Preloader('file1', 'mysound*:sound.ogg||sound.mp3');

```

#### Events

Maybe you want to know when all the files have been preloaded, and are available to use and then log that.

```javascript

myLoader.on('finish', function(){ console.log('All assets loaded.'); });

```

Or maybe we'd want to log all errors that occur.

```javascript

myLoader.on('error', function(e){ console.error(e); });

```

### License

html5Preloader is licensed under MIT License.

### Changelog

#### 0.60 - A complete rewrite
 * Deprecated old event model in favor of an EventEmitter style one. (```.onfinish = a;``` becomes ```.on('finish', a);```).
 * All downloads are now run in parallel for a speedup for most cases.
 * Deprecated ```.nowLoading``` (because of above)
