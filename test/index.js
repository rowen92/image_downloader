var chai = require("chai"),
  chaiHttp = require("chai-http"),
  expect = chai.expect(),
  url  = require("url" );

chai.use( chaiHttp );

describe("request", function( done ) {
  it("request", function() {
    parsedUrl = url.parse("http://gazongazon.ru/");
    chai.request( parsedUrl )
      .get( "/" )
      .end(function( err, res ) {
        expect( err ).to.be.null;
        expect( res ).to.have.status( 200 );
        done();
      });
  });
});
