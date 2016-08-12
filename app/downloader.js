"use strict";

/**
 * Downloader module
 * @module app/downloader
 */

var htmlparser = require("htmlparser" ),
  http = require("http" );

/**
 * Represents a downloader
 * @constructor
 * @param {object} parsedUrl Parsed URL
 */
function Downloader ( parsedUrl ) {
  this.parsedUrl = parsedUrl;
  this.parsedResult = null;
  this.urls = [];
  this.handler = new htmlparser.DefaultHandler();
}

/**
 * Analysis of an HTML document
 * @method
 * @param  {string} html HTML document
 */
Downloader.prototype.analysis = function( html ) {
  var parser = new htmlparser.Parser( this.handler );
  parser.parseComplete( html );
  this.parsedResult = this.handler.dom;
};

/**
 * Get image elements from HTML document
 * @method
 * @param  {object} option HTML options for image
 */
Downloader.prototype.getImageElements = function( option ) {
  var tags,
    tagsLength,
    url = null,
    i = 0;

	tags = htmlparser.DomUtils.getElements({
    tag_name: function( val ) {
      return val.toLowerCase() === option.tagName;
    }
  }, this.parsedResult );

  tagsLength = tags.length;

  for ( ; i < tagsLength; i++ ) {
    url = tags[ i ].attribs.src;

    if ( url && url.match( /.*\.(jpg)$/i ) ) {
      if ( url.match( /^http:\/\/.*/ ) ) {
        this.urls.push( "/" + url );
      } else {
        this.urls.push( this.parsedUrl.protocol + "//" +
                        this.parsedUrl.hostname + "/" +
                        url );
      }
    }
  }
};

/**
 * Get data image from parsed URL
 * @method
 * @param  {object} parsedUrl         Parsed image URL
 * @param  {function} FuncWriteImage  Write image
 */
Downloader.prototype.getImage = function( parsedUrl, FuncWriteImage ) {
  var body = [],
    request,
    getImageBind = this.getImage.bind( this );

  request = http.request( parsedUrl, function( response ) {
    response.setEncoding("binary" );
    response.on( "data", function( chunk ) {
      body.push( chunk );
    });
    response.on( "end", function() {
      if ( response.statusCode === 302 ) {
        body = getImageBind( url.analysis( response.headers.location ), FuncWriteImage );
      }else if ( response.statusCode === 200 ) {
        FuncWriteImage( body.join( "" ), parsedUrl.pathname.match(".+/(.+?)$")[ 1 ] );
      }else {
        console.log( response.statusCode );
      }
    });
  });

  request.on( "error", function( error ) {
    console.log( error.message );
  });

  request.end();
};

module.exports = Downloader;
