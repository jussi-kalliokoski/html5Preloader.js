/*
html5-preloader
base module
*/

var html5Preloader = (function(global){

	if (!global.XMLHttpRequest)
		var XMLHttpRequest = function () {
			try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
				catch (e) {}
			try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
				catch (e) {}
			return false;
		};
	else
		var XMLHttpRequest = global.XMLHttpRequest;

	function isIn(needle, haystack)
	{
		for (var i=0; i<haystack.length; i++)
			if (haystack[i] === needle)
				return true;
		return false;
	}

	function bindOnce(elem, evName, callback){
		return elem.addEventListener(evName, function listener(){
			elem.removeEventListener(evName, listener);
			return callback.apply(this, arguments);
		}, true);
	}

	return function html5Preloader()
	{
		var that = this, // Using this in private functions may result in errors on some javascript implementations, so this is the workaround
		filesData = [], fileLoadingList = [], playableAudioTypes = [], playableVideoTypes = [], nonplayableAudioTypes = [], nonplayableVideoTypes = [],
		audioElementSupport, audioMimeTypes, audioFileExtensions, videoElementSupport, videoMimeTypes, videoFileExtensions, SND, VID, i, supportedImageTypes = ['jpg', 'png', 'apng', 'tiff', 'svg', 'jpeg', 'pnga', 'gif'];

		this.addFiles = function()
		{
			var i, n, filepathSplit, fileIdentifier, filepath, fileExtensionSplit, filesDataType, previousState, firstAlternate, alternates = [];
			for(i=0; i<arguments.length; i++)
			{
				alternates = [];
				filepathSplit = arguments[i].split('*:');
				fileIdentifier = filepathSplit[0];
				filepath = filepathSplit[filepathSplit.length-1].split('||');
				for(n=0; n<filepath.length; n++)
				{
					fileExtensionSplit = filepath[n].split('.');
					fileExtensionSplit = fileExtensionSplit[fileExtensionSplit.length-1].toLowerCase();
					filesDataType = getType(fileExtensionSplit);
					if (filesDataType != 'unsupported')
						alternates.push({datatype: filesDataType, filepath: filepath[n]});
				}
				if (firstAlternate = alternates.shift()) // V 0.52. Please note that it's supposed to be just one =, because we're setting the value.
					fileLoadingList.push({identifier: fileIdentifier, datatype: firstAlternate.datatype, filepath: firstAlternate.filepath, alternates: alternates});
	//			Should we fire an error if no working alternative is found? It does mean that the file isn't available, so maybe we should? This needs some thought.
	//			It would introduce some problems... For example, error handlers using .loadingFile will be probable to cause errors if we do this.
	/*
				else
					that.onerror();
	*/
			}
			if (fileLoadingList.length > 0)
			{
				previousState = that.active;
				that.active = true;
				if(!previousState)
					that.loadSequence();
			}
		};
		this.loadSequence = function()
		{
			if (fileLoadingList.length < 1)
			{
				that.active = false;
				that.filesLoaded = 0;
				that.nowLoading = '';
				return that.onfinish();
			}
			cf = fileLoadingList.shift();
			if (!that.removeFile(cf.identifier)) // Let's make sure we don't get double identifiers, that would make the later loaded file inaccessible. V 0.51
			that.filesLoaded++;
			that.nowLoading = cf.identifier;
			if (cf.datatype == 'audio')
				return loadAudio(cf);
			if (cf.datatype == 'video')
				return loadVideo(cf);
			if (cf.datatype == 'image')
				return loadImage(cf);
			if (cf.datatype == 'document')
				return loadDocument(cf);
		};
		function getType(ext)
		{
			if (isIn(ext, playableAudioTypes))
				return 'audio';
			if (isIn(ext, playableVideoTypes))
				return 'video';
			if (isIn(ext, nonplayableAudioTypes) || isIn(ext, nonplayableVideoTypes))
				return 'unsupported';
			if (isIn(ext, supportedImageTypes))
				return 'image';
			return 'document';
		}
		function loadAudio(filedata){
			var snd, theloader
			try // IE9 doesn't support Audio(), and Mozilla doesn't support canplaythrough with document.createElement, so this is what I came up with.
			{
				snd = new Audio();
			}catch(e){
				snd = document.createElement('audio');
			}
			snd.src = filedata.filepath;
			theloader = that;
			bindOnce(snd, 'canplaythrough', function(){
				theloader.loadSequence();
			});
			snd.onerror = function(e){theloader.triggerError(e);};
			filesData.push({identifier: filedata.identifier, filepath: filedata.filepath, datatype: filedata.datatype, alternates: filedata.alternates, data: snd});
			snd.load();
		}
		function loadVideo(filedata){
			var vid, theloader;
			try // IE9 doesn't support Video(), and Mozilla doesn't support canplaythrough with document.createElement, so this is what I came up with.
			{
				vid = new Video();
			}catch(e){
				vid = document.createElement('video');
			}
			vid.src = filedata.filepath;
			theloader = that;
			bindOnce(vid, 'canplaythrough', function(){
				theloader.loadSequence();
			});
			vid.addEventListener('canplaythrough', function (){theloader.loadSequence();}, true);
			vid.onerror = function(e){theloader.triggerError(e);};
			filesData.push({identifier: filedata.identifier, filepath: filedata.filepath, datatype: filedata.datatype, alternates: filedata.alternates, data: vid});
			vid.load();
		}
		function loadImage(filedata)
		{
			var img = new Image(), theloader = that;
			img.src = filedata.filepath;
			img.onload = function (){theloader.loadSequence();};
			img.onerror = function(e){theloader.triggerError(e);};
			filesData.push({identifier: filedata.identifier, filepath: filedata.filepath, datatype: filedata.datatype, alternates: filedata.alternates, data: img});
		}
		function loadDocument(filedata)
		{
			filesData.push({identifier: filedata.identifier, filepath: filedata.filepath, datatype: filedata.datatype, alternates: filedata.alternates, data: false});
			var theloader = that,
			thedata = filesData[filesData.length-1],
			xhr = new XMLHttpRequest(),
			fp = filedata.filepath;
			if (!xhr)
				theloader.triggerError('XHR not available.');
			fp += ((fp.indexOf('?') === -1) ? '?' : '&') + 'sprrnd=' + Math.floor(Math.random() * 99999);
			xhr.onreadystatechange = function(){
				if(this.readyState == 4 && this.status == 200)
				{
					thedata.data = this.responseXML || this.responseText || '';
					if (!thedata.data)
						return;
					theloader.loadSequence();
				}
			};
			xhr.onerror = function (e) { theloader.triggerError(e); };
			xhr.open('GET', fp);
			xhr.send();
		}
		this.triggerError = function(e)
		{
			var i, currentFile, currentAlternate;
			for (i=0; i<filesData.length; i++) if (filesData[i].identifier == that.nowLoading)
			{
				currentFile = filesData[i];
				break;
			}
			if (currentFile.alternates.length > 0)
			{
				currentAlternate = currentFile.alternates.shift();
				currentFile.filepath = currentAlternate.filepath;
				currentFile.datatype = currentAlternate.datatype;
				fileLoadingList.unshift(currentFile);
				that.removeFile(that.nowLoading);
				return that.loadSequence();
			}
			if (this.active && this.onerror(e))
				that.loadSequence();
		}
		this.getProgress = function()
		{
			return that.filesLoaded/(that.filesLoaded+fileLoadingList.length);
		};
		this.getFile = function(id)
		{
			for(var i=0; i<filesData.length; i++)
				if (filesData[i].identifier == id)
					return filesData[i].data;
		};
		this.removeFile = function(id)
		{
			for(var i=0; i<filesData.length; i++)
				if (filesData[i].identifier == id)
					return filesData.splice(i,1);
			return false;
		};

		// CONSTRUCT: Checks for supported media types and passes on the arguments to addFiles()
		audioElementSupport = !!(document.createElement('audio').canPlayType);
		audioMimeTypes = ['audio/mpeg', 'audio/ogg', 'audio/wav'];
		audioFileExtensions = [['mp3'], ['ogg'], ['wav']];

		videoElementSupport = !!(document.createElement('video').canPlayType);
		videoMimeTypes = ['video/mp4', 'video/ogg', 'video/divx'];
		videoFileExtensions = [['mp4', 'mpeg', 'mpg'], ['ogv', 'oga'], ['dvx', 'divx', 'xdiv']];

		if (audioElementSupport)
		{
			SND = document.createElement('audio');
			for (i=0; i<audioMimeTypes.length; i++)
				if ('no' != SND.canPlayType(audioMimeTypes[i]) && '' != SND.canPlayType(audioMimeTypes[i]))
					playableAudioTypes = playableAudioTypes.concat(audioFileExtensions[i]);
				else
					nonplayableAudioTypes = nonplayableAudioTypes.concat(audioFileExtensions[i]);
		}
		if (videoElementSupport)
		{
			VID = document.createElement('video');
			for (i=0; i<videoMimeTypes.length; i++)
				if ('no' != VID.canPlayType(videoMimeTypes[i]) && '' != VID.canPlayType(videoMimeTypes[i]))
					playableVideoTypes = playableVideoTypes.concat(videoFileExtensions[i]);
				else
					nonplayableVideoTypes = nonplayableVideoTypes.concat(videoFileExtensions[i]);
		}
		this.addFiles.apply(this, arguments);
	}
})(this);
html5Preloader.prototype =
{
	active: false,
	filesLoaded: 0,
	nowLoading: '',
	version: 0.54, // As of V 0.52, this value is controlled by the makefile. # Should it be set here at all? Waste of precious bytes. # Yes, it should be, to make this source file work standalone.
	onfinish: function(){},
	onerror: function(e){return true;}
};
