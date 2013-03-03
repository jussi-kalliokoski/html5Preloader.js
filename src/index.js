var html5Preloader = function (XHR) {
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

//import "resource.js"
//import "preloader.js"
//import "xhr-resource.js"
//import "media-resource.js"

Preloader.types = {
    image: MediaResource,
    audio: MediaResource,
    video: MediaResource
}

return Preloader

}(window.XMLHttpRequest)
