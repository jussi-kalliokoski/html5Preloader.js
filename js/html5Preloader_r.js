(function(global){
	var	XMLHttpRequest = global.XMLHttpRequest || function () { // IE FIX
			try {
				return new ActiveXObject("Msxml2.XMLHTTP.6.0");
			}catch (err1) {}
			try {
				return new ActiveXObject("Msxml2.XMLHTTP.3.0");
			}catch (err2) {}
			return false;
		},
		AudioElement = global.Audio ? // IE FIX
			function(){
				return new Audio();
			} :
			function(){
				return document.createElement('audio');
			},,
		AudioElement = global.Video ? // IE FIX
			function(){
				return new Video();
			} :
			function(){
				return document.createElement('video');
			},
		codecs = { // Chart from jPlayer
			oga: { // OGG
				codec: 'audio/ogg; codecs="vorbis"',
				media: 'audio'
			},
			wav: { // PCM
				codec: 'audio/wav; codecs="1"',
				media: 'audio'
			},
			webma: { // WEBM
				codec: 'audio/webm; codecs="vorbis"',
				media: 'audio'
			},
			mp3: {
				codec: 'audio/mpeg; codecs="mp3"',
				media: 'audio'
			},
			m4a: { // AAC / MP4
				codec: 'audio/mp4; codecs="mp4a.40.2"',
				media: 'audio'
			},
			ogv: { // OGG
				codec: 'video/ogg; codecs="theora, vorbis"',
				media: 'video'
			},
			webmv: { // WEBM
				codec: 'video/webm; codecs="vorbis, vp8"',
				media: 'video'
			},
			m4v: { // H.264 / MP4
				codec: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
				media: 'video'
			}
		},
		support = {
			imageTypes: ['jpg', 'png', 'jpeg', 'tiff']
		};
		codecs.ogg = codecs.oga; // :)

	function isIn(needle, haystack){
		var i, l = haystack.length;
		for (i=0; i<l; i++){
			if (needle === haystack[i]){
				return true;
			}
		}
		return false;	
	}

	function loadFile(file, onfinish, onerror){
		if (this.constructor !== loadFile){
			return new loadFile(file);
		}

		var	self = this;
			a, b, c;

		if (typeof file === 'string'){
			a = file.split('*:');
			b = a[ a[1] ? 1 : 0 ].split('||');
			self.id = a[1] ? a[0] : b[0];
			self.alternates = [];
			for (a = 0; a < b.length; a++){
				c = b[a].split('.');
				c = c[c.length - 1].toLowerCase();
				if (codecs[c] && !codecs[c].supported){
					continue;
				}
				alternates.push({
					type: codecs[c] ? codecs[c].media : isIn(c, supported.imageTypes) ? 'image' : 'document',
					path: b[a];
				});
			}
		} else {
			throw (new TypeError());
		}

		function loadNext(){
			var file = self.alternates.shift();
			loadFile[file.type](
				file.path,
				function(){
					if (typeof self.onfinish === 'function'){
						self.onfinish.call(self);
					}
				},
				function(e){
					if (self.alternates.length){
						return loadNext();
					}
					if (typeof self.onerror === 'function'){
						self.onerror.call(self, e);
					}
				}
			);
		}

		self.onfinish = onfinish;
		self.onerror = onerror;
	}

	function MediaFile(construct){

		function load(file, onfinish, onerror){
			if (this.constructor !== load){
				return new load(file);
			}
			this.onfinish = onfinish;
			this.onerror = onerror;

			var	self = this,
				file = construct();
			function onready(){
				if (onready.z){
					return;
				}
				onready.z = true;
				if (typeof self.onfinish === 'function'){
					self.onfinish.call(file);
				}
			}
			if (file.addEventListener){
				file.addEventListener('canplaythrough', onready, true);
			}
			file.onload = onready;
			file.onerror = function (e){
				if (typeof self.onerror === 'function'){
					self.onerror.call(file, e);
				}
			};
		}
		return load;
	}

	loadFile.audio = MediaFile(AudioElement);
	loadFile.video = MediaFile(VideoElement);
	loadFile.image = MediaFile(Image);
	loadFile.document = function(file, onfinish, onerror){
		var	self = this,
			xhr = new XMLHttpRequest();

		if (self.constructor !== loadFile.document){
			return new loadFile.document(file);
		}
		this.onfinish = onfinish;
		this.onerror = onerror;

		if (!xhr){
			if (typeof this.onerror === 'function'){
				this.onerror.call(xhr, new Error('No XHR!'));
			}
		}

		file += (file.indexOf('?') === -1 ? '?' : ':') + 'randndate=' + Math.floor( Math.random() * 99999 ) + new Date().getTime();

		xhr.onreadystatechange = function(){
			if (this.readyState === 4 && this.status === 200 && typeof self.onfinish === 'function'){
				self.onfinish.call(this.responseXML || this.responseText || '');
			}
		};
		xhr.onerror = function(e){
				if (typeof self.onerror === 'function'){
					self.onerror.call(file, e);
				}
		};
		xhr.open('GET', file);
		xhr.send();
	};

	function testSupported(){
		if (testSupported.tested){
			return;
		}
		testSupported.tested = true;
		var 	dummyAudio = AudioElement(),
			dummyVideo = VideoElement(),
			i;
		support.audio = !!dummyAudio.canPlayType;
		support.video = !!dummyVideo.canPlayType;
		support.audioTypes = [];
		support.videoTypes = [];
		for (i in codecs){
			if (codecs[i].media === 'video'){
				if (dummyVideo.canPlayType(codecs[i].codec){
					support.videoTypes.push(i);
					codecs[i].supported = true;
				} else {
					codecs[i].supported = false;
				}
				
			} else if (codecs[i].media === 'audio'){
				if (dummyAudio.canPlayType(codecs[i].codec)){
					support.audioTypes.push(i);
					codecs[i].supported = true;
				} else {
					codecs[i].supported = false;
				}
			}
		}
	}

	function html5Preloader(){

		if (this.constructor !== html5Preloader){
			throw new Error('html5Preloader must be used as a constructor.');
		}

		testSupported();
		
		var	self		= this,
			filelist	= [],
			datalist	= [],
			currentFilename, currentFileData;

		function onerror(e){
			if (typeof self.onerror === 'function'){
				if (self.onerror.call(self, e)){
					sequence();
				}
			} else {
				sequence();
			}
		}

		function onfinish(){
			if (typeof self.onfinish === 'function'){
				self.onfinish.call(self);
			}
		}

		function sequence(){
			if (!filelist.length){
				return onfinish();
			}
			currentFilename = filelist.shift();
			currentFileData = loadFile(currentFilename, sequence, onerror);
		}

		self.addFiles = function(){
			var i, l = arguments.length;
			for (i=0; i<l; i++){
				filelist.push(arguments[i]);
			}
			sequence();
		};

		self.addFiles.apply(this, arguments);
	}

	html5Preloader.testSupported = testSupported; // We'll make the charts accessible so that it's possible to not get this data over and over again in projects.
	html5Preloader.codecs = codecs;
	html5Preloader.support = support;
	html5Preloader.loadFile = loadFile;

	global.html5Preloader = html5Preloader;
}(this));
