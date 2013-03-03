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
