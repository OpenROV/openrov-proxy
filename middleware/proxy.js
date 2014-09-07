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
    // we first make a HEAD request to see if the file is there. If not, or there
    // is any other issue, we return the error to the requestor as a JSON object.
    request.head(meta, function(error, response, body) {
      if (error || (response !== undefined && response.statusCode >= 400)) {
        if (response) { console.log(response.statusCode); }
        var statusCode = 0;
        if (response) { statusCode = response.statusCode; } 
        stream.write(JSON.stringify({ error: error, statusCode: statusCode}));  
        stream.end();
        console.log('There was an error: ' + error + '\nStatus Code: ' + statusCode );
      }
      else {
        // once we are sure all is good, we go ahead and request the file and pipe it to the requestor
        request(meta, function(error, response, body) {
          console.log('Done');
          stream.end();
        })
        // this is where some magic happens.
        // we pipe the data from the 'request()' directly to the stream
        // on the browser, this will be piped directly to the ROV.
        .pipe(stream);
      }
    });
  });

});
server.listen(3001, function() {
  console.log('HTTP and BinaryJS server started on port 3001');
});

