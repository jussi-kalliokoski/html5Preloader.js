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
