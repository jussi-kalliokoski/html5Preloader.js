/*
html5-preloader
*/

if (typeof Array.prototype.inArray != 'function')
	Array.prototype.inArray = function(needle)
	{
		for (var i=0; i<this.length; i++)
			if (this[i] === needle)
				return true;
		return false;
	};

function html5Preloader()
{
	var that = this, fileData = [], fileLoadingList = [], playableAudioTypes = [], playableVideoTypes = [], nonplayableAudioTypes = [], nonplayableVideoTypes = [],
	audioElementSupport, audioMimeTypes, audioFileExtensions, videoElementSupport, videoMimeTypes, videoFileExtensions, SND, VID, i, supportedImageTypes = ['jpg', 'png', 'apng', 'tiff', 'svg', 'jpeg', 'pnga', 'gif'];

	this.addFiles = function()
	{
		var i, n, filepathSplit, fileIdentifier, filepath, fileExtensionSplit, fileDataType, previousState, firstAlternate, alternates = [];
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
				fileDataType = getType(fileExtensionSplit);
				if (fileDataType != 'unsupported')
					alternates.push({datatype: fileDataType, filepath: filepath[n]});
			}
			firstAlternate = alternates.shift();
			fileLoadingList.push({identifier: fileIdentifier, datatype: firstAlternate.datatype, filepath: firstAlternate.filepath, alternates: alternates});
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
		if (playableAudioTypes.inArray(ext))
			return 'audio';
		if (playableVideoTypes.inArray(ext))
			return 'video';
		if (nonplayableAudioTypes.inArray(ext) || nonplayableVideoTypes.inArray(ext))
			return 'unsupported';
		if (supportedImageTypes.inArray(ext))
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
		snd.addEventListener('canplaythrough', function (){theloader.loadSequence();}, true);
		snd.onerror = function(e){theloader.triggerError(e);};
		fileData.push({identifier: filedata.identifier, filepath: filedata.filepath, datatype: filedata.filepath, alternates: filedata.alternates, data: snd});
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
		vid.addEventListener('canplaythrough', function (){theloader.loadSequence();}, true);
		vid.onerror = function(e){theloader.triggerError(e);};
		fileData.push({identifier: filedata.identifier, filepath: filedata.filepath, datatype: filedata.filepath, alternates: filedata.alternates, data: vid});
		vid.load();
	}
	function loadImage(filedata)
	{
		var img = new Image(), theloader = that;
		img.src = filedata.filepath;
		img.onload = function (){theloader.loadSequence();};
		img.onerror = function(e){theloader.triggerError(e);};
		fileData.push({identifier: filedata.identifier, filepath: filedata.filepath, datatype: filedata.filepath, alternates: filedata.alternates, data: img});
	}
	function loadDocument(filedata)
	{
		fileData.push({identifier: filedata.identifier, filepath: filedata.filepath, datatype: filedata.filepath, alternates: filedata.alternates, data: false});
		if (!jQuery || !jQuery.ajax)
			return that.loadSequence;
		var theloader = that,
		thedata = fileData[fileData.length-1];
		jQuery.ajax({url: filedata.filepath, data: {rnduux: Math.random()}, cache: false, success: function(data)
		{
			thedata.data = data;
			theloader.loadSequence();
		},
		error: function (a,b,c){ theloader.triggerError([a,b,c]); }});
	}
	this.triggerError = function(e)
	{
		var i, currentFile, currentAlternate;
		for (i=0; i<fileData.length; i++) if (fileData[i].identifier == that.nowLoading)
		{
			currentFile = fileData[i];
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
		for(var i=0; fileData.length; i++)
			if (fileData[i].identifier == id)
				return fileData[i].data;
	};
	this.removeFile = function(id)
	{
		for(var i=0; fileData.length; i++)
			if (fileData[i].identifier = id)
				return fileData.splice(i,1);
	};

	// CONSTRUCT
	audioElementSupport = !!(document.createElement('audio').canPlayType);
	audioMimeTypes = ['audio/mpeg', 'audio/ogg'];
	audioFileExtensions = [['mp3'], ['ogg']];

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
html5Preloader.prototype =
{
	active: false,
	filesLoaded: 0,
	nowLoading: '',
	version: 0.5,
	onfinish: function(){},
	onerror: function(e){return true;}
};
