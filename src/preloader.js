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

Preloader.prototype = Resource()
