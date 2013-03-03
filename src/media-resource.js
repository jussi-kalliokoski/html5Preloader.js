function MediaResource (options, callback, errorCallback) {
    if ( !(this instanceof MediaResource) ) {
        return new MediaResource(options, callback, errorCallback)
    }

    var self = this
    var el = this.content = elem(options.type)

    options.handlers = {
        load: this.onReady,
        canplaythrough: this.onReady,
        error: this.done
    }

    if ( typeof options.src === 'string' ) {
        el.src = options.src
    } else {
        for ( var i = 0; i < options.src.length; i++ ) {
            var src = options.src[i]
            var s = elem('source')

            if ( typeof src !== 'string') {
                s.setAttribute('type', src.type)
                src = src.src
            }

            s.setAttribute('src', src)
            el.appendChild(s)
        }
    }

    this.init(options, callback, errorCallback)

    if ( options.type === 'image' && el.naturalWidth ) {
        return this.done()
    }

    if ( el.load ) el.load()
}

MediaResource.prototype = Resource()
