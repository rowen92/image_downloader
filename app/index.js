"use strict";

var htmlparser = require("htmlparser" ),
  http = require("http" ),
  fs   = require( "fs" ),
  url  = require("url" ),
  path = require("path" ),
  Downloader = require("./downloader");

var parsedUrl = url.parse("http://gazongazon.ru/our-lawn.html"),
  html = [],
  request;

request = http.request( parsedUrl, function( response ) {
  response.setEncoding( "utf8" );
  response.on( "data", function( chunk ) {
    html.push( chunk );
  });
  response.on( "end", function() {
    var urlsLength,
      downloader = new Downloader( parsedUrl );

    downloader.analysis( html.join("" ) );
    downloader.getImageElements({ tagName:"img" });
    urlsLength = downloader.urls.length;

    for ( var i = 0; i < urlsLength; i++ ) {
      console.log( "Downloaded " + downloader.urls[ i ] );
      downloader.getImage( url.parse( downloader.urls[ i ] ), writeImage );
    }
  });
});

request.on("error", function( e ) {
  console.error( e.message );
});

request.end();


/**
 * Write image
 * @param  {object} imageData Data of image
 * @param  {string} fileName  File name
 */
function writeImage( imageData, fileName ) {
  var imageDir = "downloaded_images";
  fs.stat( imageDir, function( error ) {
    if ( error ) {
      fs.mkdirSync( imageDir );
      fs.writeFile( imageDir + "/" + fileName, imageData, "binary", function( error ) {
        if ( error ) {
          console.log( error );
        }
      });
    }
  });
}
