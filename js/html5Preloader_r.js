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
			},
		VideoElement = global.Video ? // IE FIX
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
		},
		FUNC = Function;
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
		if (!(this instanceof loadFile)){
			return new loadFile(file, onfinish, onerror);
		}

		var	self		= this,
			alternates	= [],
			a, b, c;

		if (typeof file === 'string'){
			a = file.split('*:');
			b = a[ a[1] ? 1 : 0 ].split('|');
			self.id = a[1] ? a[0] : b[0];
			self.alternates = alternates;
			for (a = 0; a < b.length; a++){
				c = b[a].split('.');
				c = c[c.length - 1].toLowerCase();
				if (codecs[c] && !codecs[c].supported){
					continue;
				}
				alternates.push({
					type: codecs[c] ? codecs[c].media : isIn(c, support.imageTypes) ? 'image' : 'document',
					path: b[a]
				});
			}
		} else {
			throw (new TypeError());
		}

		function loadNext(){ // This is a compromise between readability and compactness
			var file = alternates.shift();
			file ? new loadFile[file.type](
				file.path,
				function(){
					self.dom = this;
					if (typeof self.onfinish === 'function'){
						self.onfinish.call(self);
					}
				},
				function(e){
					self.dom = this;
					if (self.alternates.length){
						return loadNext();
					}
					if (typeof self.onerror === 'function'){
						self.onerror.call(self, e);
					}
				}
			) : self.onerror instanceof FUNC ?
				self.onerror.call(self, new Error('No viable alternatives')
			) : self.onfinish instanceof FUNC &&
				self.onfinish.call(self);
		}

		self.onfinish = onfinish;
		self.onerror = onerror;

		loadNext();
	}

	function MediaFile(construct){
		return function (filename, onfinish, onerror){
			var	self = this,
				file = construct();

			self.onfinish = onfinish;
			self.onerror = onerror;

			function onready(){
				file.onload = null;
				file.removeEventListener('canplaythrough', onready);
				if (typeof self.onfinish === 'function'){
					self.onfinish.call(file);
				}
			}
			file.addEventListener && file.addEventListener('canplaythrough', onready, true);
			file.onload = onready;
			file.onerror = function (e){
				if (typeof self.onerror === 'function'){
					self.onerror.call(file, e);
				}
			};
			self.dom = file;
			file.src = filename;
			file.load && file.load();
		};
	}

	loadFile.audio = MediaFile(AudioElement);
	loadFile.video = MediaFile(VideoElement);
	loadFile.image = MediaFile(Image);
	loadFile.document = function(file, onfinish, onerror){
		var	self		= this,
			parsedUrl	= /(\[((!)?(.+)?\])?$/.exec(file),
			mimeType	= parsedUrl[3],
			xhr		= self.dom = new XMLHttpRequest();

		self.onfinish = onfinish;
		self.onerror = onerror;

		if (!xhr){
			self.onerror instanceof FUNC && self.onerror.call(xhr, new Error('No XHR!'));
			return;
		}

		file		= file.substr(0, file.length - parsedUrl[0].length);
		file		+= parsedUrl[2] ? (file.indexOf('?') === -1 ? '?' : '&') + 'fobarz=' + (+new Date) : '';

		mimeType && xhr.overrideMimeType(mimeType === '@' ? 'text/plain; charset=x-user-defined' : mimeType);

		xhr.onreadystatechange = function(){
			var that = this, dom = self.dom = that.responseXML || String(that.responseText || '');
			if (that.readyState === 4){
				that.status === 200 ?
					self.onfinish instanceof FUNC && self.onfinish.call(dom) :
					self.onerror instanceof FUNC && self.onerror(that);
			}
		};
		xhr.onerror = function(e){
			self.onerror instanceof FUNC &&	self.onerror.call(xhr, e);
		};
		xhr.open('GET', file, true);
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
			if (codecs.hasOwnProperty(i)){
				if (codecs[i].media === 'video'){
					(codecs[i].supported = dummyVideo.canPlayType(codecs[i].codec)) && support.videoTypes.push(i);		
				} else if (codecs[i].media === 'audio'){
					(codecs[i].supported = dummyAudio.canPlayType(codecs[i].codec)) && support.audioTypes.push(i);
				}
			}
		}
	}

	function html5Preloader(){

		if (!(this instanceof html5Preloader)){
			throw new Error('html5Preloader must be used as a constructor.');
		}

		testSupported();
		
		var	self		= this,
			filelist	= [],
			datalist	= [],
			currentFilename, currentFileData;

		function onerror(e){
			if (self.onerror instanceof FUNC){
				if (self.onerror.call(self, e)){
					sequence();
				}
			} else {
				sequence();
			}
		}

		function onfinish(){
			if (self.onfinish instanceof FUNC){
				self.onfinish.call(self);
			}
		}

		function sequence(){
			if (!filelist.length){
				return onfinish();
			}
			currentFilename = filelist.shift();
			datalist.push(currentFileData = new loadFile(currentFilename, sequence, onerror));
		}

		self.addFiles = function(){
			var i, l = arguments.length;
			for (i=0; i<l; i++){
				filelist.push(arguments[i]);
			}
			sequence();
		};

		arguments.length && self.addFiles.apply(self, arguments);

		self.get = self.getFile = function(id){
			var i, l = datalist.length;
			for (i=0; i<l; i++){
				if(datalist[i].id === id){
					return datalist[i].dom && datalist[i].dom.constructor === String ? String(datalist[i].dom) : datalist[i].dom;
				}
			}
		}
	}

	html5Preloader.testSupported = testSupported; // We'll make the charts accessible so that it's possible to not get this data over and over again in projects.
	html5Preloader.codecs = codecs;
	html5Preloader.support = support;
	html5Preloader.loadFile = loadFile;

	global.html5Preloader = html5Preloader;
}(this));
