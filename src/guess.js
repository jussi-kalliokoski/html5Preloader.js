Preloader.guess = function (file) {
    /* if just a string, assume it's the `src` property */
    if ( typeof file === 'string' ) {
        file = {
            src: file
        }
    }

    /*
     * if the `src` is a string, use it for detecting the extension,
     * otherwise use the first in the array
    */
    var src = typeof file.src === 'string' ? file.src : file.src[0]
    /* extract the file extension, if any */
    var ext = /^\w*$/.exec(src)[0]
    if ( !file.type ) {
        for (var k in Preloader.guess.types) {
            if ( !hasOwn(Preloader.guess.types, k) ) continue
            if ( Preloader.guess.types[k].indexOf(src) === -1) continue

            file.type = k
            break
        }
    }

    return file
}

Preloader.guess.types = {
    audio: ['mp3', 'ogg', 'oga', 'm4a', 'flac', 'aac', 'alac', 'wma', 'opus'],
    video: ['mp4', 'm4v', 'ogv', 'mpg', 'mpeg', 'avi', 'wmv', 'vp8', 'webm'],
    image: ['png', 'apng', 'gif', 'jpg', 'jpeg', 'tiff', 'bmp']
}
