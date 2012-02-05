var html5Preloader = (function () {

var	XHR = typeof XMLHttpRequest === 'undefined' ? function () { // IE FIX
		try {
			return new ActiveXObject("Msxml2.XMLHTTP.6.0");
		} catch (err1) {}
		try {
			return new ActiveXObject("Msxml2.XMLHTTP.3.0");
		} catch (err2) {}

		return null;
	} : XMLHttpRequest,
	AudioElement = typeof Audio !== 'undefined' ? // IE FIX
		function(){
			return new Audio();
		} :
		function(){
			return document.createElement('audio');
		},
	VideoElement = typeof Video !== 'undefined' ? // IE FIX
		function () {
			return new Video();
		} :
		function () {
			return document.createElement('video');
		},
	ImageElement = function () {
		return new Image();
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
		},
	},
	support = {
		imageTypes: ['jpg', 'png', 'jpeg', 'tiff', 'gif'],
	},
	ID_PREFIX = 'FILE@';

codecs.ogg = codecs.oga; // :)

function bindOnce (elem, evName, callback) {
	return elem.addEventListener && elem.addEventListener(evName, function listener () {
		elem.removeEventListener(evName, listener);
		return callback.apply(this, arguments);
	}, true);
}

function isIn (needle, haystack) {
	for (var i=0; i<haystack.length; i++) {
		if (haystack[i] === needle) {
			return true;
		}
	}

	return false;
}

function map (arr, callback) {
	if (arr.map) {
		return arr.map(callback);
	}

	var	r = [],
		i;
	for (i=0; i<arr.length; i++) {
		r.push(callback(arr[i]));
	}

	return r;
}

function EventEmitter () {
	var k;
	for (k in EventEmitter.prototype) {
		if (EventEmitter.prototype.hasOwnProperty(k)) {
			this[k] = EventEmitter.prototype[k];
		}
	}
	this._listeners = {};
};

EventEmitter.prototype = {
	_listeners: null,

	emit: function (name, args) {
		args = args || [];
		if (this._listeners[name]) {
			for (var i=0; i<this._listeners[name].length; i++) {
				this._listeners[name][i].apply(this, args);
			}
		}
		return this;
	},

	on: function (name, listener) {
		this._listeners[name] = this._listeners[name] || [];
		this._listeners[name].push(listener);
		return this;
	},

	off: function (name, listener) {
		if (this._listeners[name]) {
			if (!listener) {
				delete this._listeners[name];
				return this;
			}
			for (var i=0; i<this._listeners[name].length; i++) {
				if (this._listeners[name][i] === listener) {
					this._listeners[name].splice(i--, 1);
				}
			}
			this._listeners[name].length || delete this._listeners[name];
		}
		return this;
	},

	once: function (name, listener) {
		function ev () {
			this.off(ev);
			return listener.apply(this, arguments);
		}

		return this.on(name, ev);
	},
};

function loadFile (file, callback) {
	if (!(this instanceof loadFile)) {
		return new loadFile(file, callback);
	}

	var	self		= this,
		alternates	= [],
		a, b, c;

	if (typeof file === 'string') {
		a = file.split('*:');
		b = a[ a[1] ? 1 : 0 ].split('||');
		self.id = a[1] ? a[0] : b[0];
		self.alternates = alternates;

		for (a=0; a<b.length; a++) {
			c = b[a].split('.');
			c = c[c.length - 1].toLowerCase();

			if (codecs[c] && !codecs[c].supported) {
				continue;
			}

			alternates.push({
				type: codecs[c] ? codecs[c].media : isIn(c, support.imageTypes) ? 'image' : 'document',
				path: b[a],
			});
		}
	} else {
		return callback(TypeError('Invalid path'), self);
	}

	function loadNext() {
		var file = alternates.shift();
		file ? new loadFile[file.type](
			file.path,
			function (e, f) {
				self.dom = f && f.dom;

				if (e && self.alternates.length) {
					return loadNext();
				}

				callback(e, self);

			}) :
			callback(Error('No viable alternatives'), null);
	}

	loadNext();
}

function MediaFile (construct) {
	return function (filename, callback) {
		var	self = this,
			file = construct();

		function onready () {
			file.onload = file.onerror = null;
			file.removeEventListener('canplaythrough', onready);

			callback(null, self);
		}

		file.addEventListener && file.addEventListener('canplaythrough', onready, true);
		file.onload = onready;
		file.onerror = function (e) {
			callback(e, self);
		};

		self.dom = file;
		file.src = filename;

		file.load && file.load();
	};
}

loadFile.audio = MediaFile(AudioElement);
loadFile.video = MediaFile(VideoElement);
loadFile.image = MediaFile(ImageElement);

loadFile.document = function (file, callback) {
	var	self		= this,
		parsedUrl	= /(\[(!)?(.+)?\])?$/.exec(file),
		mimeType	= parsedUrl[3],
		xhr		= self.dom = new XHR();

	if (!xhr) {
		return callback(Error('No XHR!'), self);
	}

	file		= file.substr(0, file.length - parsedUrl[0].length);
	file		+= parsedUrl[2] ? (file.indexOf('?') === -1 ? '?' : '&') + 'fobarz=' + (+new Date) : '';

	mimeType && xhr.overrideMimeType(mimeType === '@' ? 'text/plain; charset=x-user-defined' : mimeType);

	xhr.onreadystatechange = function () {
		var dom = self.dom = xhr.responseXML || String(xhr.responseText || '');

		if (xhr.readyState === 4) {
			xhr.status === 200 ?
				callback(null, self) :
				callback({e: Error('Request failed: ' + xhr.status)}, self) ;
		}
	};

	xhr.onerror = function (e) {
		callback(e, self);
	};

	xhr.open('GET', file, true);
	xhr.send();
};

(function () {
	var 	dummyAudio = AudioElement(),
		dummyVideo = VideoElement(),
		i;

	support.audio = !!dummyAudio.canPlayType;
	support.video = !!dummyVideo.canPlayType;

	support.audioTypes = [];
	support.videoTypes = [];

	for (i in codecs) {
		if (codecs.hasOwnProperty(i)) {
			if (codecs[i].media === 'video') {
				(codecs[i].supported = dummyVideo.canPlayType(codecs[i].codec)) && support.videoTypes.push(i);		
			} else if (codecs[i].media === 'audio') {
				(codecs[i].supported = dummyAudio.canPlayType(codecs[i].codec)) && support.audioTypes.push(i);
			}
		}
	}
}());

function html5Preloader () {
	if (!(this instanceof html5Preloader)) {
		return arguments.length ? (new html5Preloader(arguments[0])) : (new html5Preloader());
	}
	var self = this;

	self.files = [];

	html5Preloader.EventEmitter.call(this);

	self._loadcb = function (e, f) {
		self.filesLoaded++;

		self.emit(e ? 'error' : 'fileloaded', e ? [e, f] : [f]);

		if (self.filesLoading - self.filesLoaded === 0) {
			self.active = false;
			self.emit('finish');
			self.filesLoading = 0;
			self.filesLoaded = 0;
		}
	};

	arguments.length && self.loadFiles.apply(this, arguments);
}

html5Preloader.prototype = {
	active: false,
	files: null,
	filesLoading: 0,
	filesLoaded: 0,

	getFile: function (id) {
		return	typeof id === 'undefined' ? map(this.files, function (f) {
				return f.dom;
			}) :
			typeof id === 'number' ? this.files[id].dom :
			typeof id === 'string' ? this.files[ID_PREFIX + id].dom :
			null;
	},

	removeFile: function (id) {
		var f, i;
		switch (typeof id) {
		case 'undefined':
			this.files = [];
			break;
		case 'number':
			f = this.files[id];
			this.files[ID_PREFIX + f.id] && delete this.files[ID_PREFIX + f.id];
			this.files.splice(id, 1);
			break;
		case 'string':
			f = this.files[ID_PREFIX + f.id];
			this.files[ID_PREFIX + f.id] && delete this.files[ID_PREFIX + f.id];

			for (i=0; i<this.files.length; i++) {
				this.files.splice(i--, 1);
			}
		}
	},

	loadFiles: function () {
		var	files	= [].slice.call(arguments),
			self	= this,
			i, f;

		for (i=0; i<files.length; i++) {
			f = html5Preloader.loadFile(files[i], self._loadcb);
			self.files.push(f);
			self.files[ID_PREFIX + f.id] = f;
			self.filesLoading++;
		}

		self.active = self.active || !!self.filesLoading;
	},

	getProgress: function () {
		return this.filesLoading ? this.filesLoading / this.filesLoading : 1.0;
	},
};

html5Preloader.support = support;
html5Preloader.loadFile = loadFile;
html5Preloader.EventEmitter = EventEmitter;

return html5Preloader;

}());
