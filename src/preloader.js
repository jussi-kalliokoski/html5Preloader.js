var Preloader = function (XHR) {
"use strict";

XHR = XHR || function () {
    try {
        return new ActiveXObject("Msxml2.XMLHTTP.6.0");
    } catch (err1) {}
    try {
        return new ActiveXObject("Msxml2.XMLHTTP.3.0");
    } catch (err2) {}

    return null;
}

var elem = function (type) {
    return document.createElement(type)
}

var bind = function (what, where) {
    return function () {
        return what.apply(where, arguments)
    }
}

var hasOwn = bind(Function.call, Object.prototype.hasOwnProperty)

/**
 * A base class for all resources.
 *
 * @class
*/
function Resource () {
    if ( !(this instanceof Resource) ) return new Resource()
}

/**
 * Initializes the resource.
 *
 * @param {Function} callback A function that gets called when the resource has finished loading.
*/
Resource.prototype.init = function (options, callback, errorCallback) {
    this.ready = false
    this.error = false
    this.progress = 0

    /* Force asynchronous callback */
    this.callback = function (e) {
        this.progress = 1
        setTimeout(function () {
            if ( e ) {
                if (errorCallback) errorCallback(e)
            } else {
                callback()
            }
        }, 0)
    }

    /* Request CORS headers */
    this.content.crossOrigin = 'anonymous'

    /* Extend the DOM with options */
    var props = options.properties || {}
    for (var k in props) {
        if ( !hasOwn(props, k) ) continue

        this.content[k] = props[k]
    }

    /* Bind events */
    this.events = []

    var handlers = options.handlers
    for (var k in handlers) {
        if ( !hasOwn(handlers, k) ) continue

        var handler = bind(handlers[k], this)
        this.content.addEventListener(k, handler)
        this.events.push([k, handler])
    }
}

/**
 * Prepares the resource for garbage collection.
*/
Resource.prototype.destroy = function () {
    while ( this.events.length ) {
        var ev = this.events.pop()
        this.content.removeEventListener(ev[0], ev[1], true)
    }
}

/**
 * An internal function to call when the resource has finished loading.
 *
 * @param {Error} [e] The error that occured, if any.
*/
Resource.prototype.done = function (e) {
    if ( this.ready ) return

    this.ready = true
    this.error = !!e
    this.destroy()

    this.callback(e)
}

Resource.prototype.onReady = function () {
    this.done()
}


function XHRResource (options, callback, errorCallback) {
    if ( !(this instanceof XHRResource) ) {
        return new XHRResource(options, callback, errorCallback)
    }

    var self = this
    var xhr = this.content = new XHR()

    options.handlers = {
        error: this.done,
        readystatechange: function () {
            if ( xhr.readyState !== 4 ) return

            if ( String(xhr.status)[0] !== '2' ) {
                var err = new Error(xhr.status + ' (' + xhr.statusText + ')')
                return this.done(err)
            }

            this.done()
        }
    }

    this.init(options, callback, errorCallback)

    var url = options.src

    xhr.open('GET', url, true)
    xhr.send(null)
}

XHRResource.prototype = Resource()


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


function Preloader (files, callback, errorCallback) {
    var cb = bind(this.done, this)
    this.content = []
    this.init({}, callback, errorCallback)
    var f = this.content = []

    if ( !files.length ) return cb()

    for ( var i = 0; i < files.length; i++ ) {
        var file = files[i]
        if ( file.type in Preloader.types ) {
            f.push(Preloader.types[file.type](file, cb, cb))
        } else {
            f.push(XHRResource(file))
        }
    }
}

Preloader.types = {
    image: MediaResource,
    audio: MediaResource,
    video: MediaResource
}

Preloader.prototype = Resource()


return Preloader

}(window.XMLHttpRequest)
