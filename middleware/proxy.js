var http = require('http');
var BinaryServer = require('binaryjs').BinaryServer;
var express = require('express');
var request = require('request');

var app = express();
var server = http.createServer(app);
var bs = BinaryServer({server: server});

bs.on('connection', function(client){
  console.log('Connection to client');
  // Incoming stream from browsers
  client.on('stream', function(stream, meta) {
    console.log('Stream requested, url: ' + meta);
    request(meta, function(error, response, body) {
      //TODO Error handling
      console.log('Done');
      stream.end();
    })
      // this is where some magic happens.
      // we pipe the data from the 'request()' directly to the stream
      // on the browser, this will be piped directly to the ROV.
      .pipe(stream);
  });

});
server.listen(3001, function() {
  console.log('HTTP and BinaryJS server started on port 3001');
});

