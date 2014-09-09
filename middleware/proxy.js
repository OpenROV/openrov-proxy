var url = require('url');
var net = require('net');
var http = require('http');
var BinaryServer = require('binaryjs').BinaryServer;
var express = require('express');
var request = require('request');

var app = express();
var server = http.createServer(app);
var bs = BinaryServer({server: server});
var net = require('net');

bs.on('connection', function(client){
  console.log('Connection to client');
  // Incoming stream from browsers
  client.on('stream', function(stream, meta) {
    console.log('meta: ' + meta);

    if (meta.indexOf('{') == 0) {

            var req = JSON.parse(meta);
      var requestUrl = req.url;
      console.log('Got SSL connection request to ' + requestUrl);
      var srvUrl = url.parse(requestUrl );
      console.log(srvUrl.port);

      var client = net.connect({port: srvUrl.port, host: srvUrl.hostname},
        function() { //'connect' listener
          console.log('CONNECTED ' + stream.readable + '/' + stream.writable);
        });
      client.on('connect', function(){
        console.log('client connected xx');
        stream.write('HTTP/1.1 200 Connection Established\r\n' +
          'Proxy-agent: Node-Proxy\r\n' +
          '\r\n');
        //stream.write("OK\r\n\r\n");
      });

      stream.on('data', function (data) {
        console.log('@@@@@');
        client.write(data);
      });

      client.on('data', function(data) {
        stream.write(data);
        //console.log(data.toString());
        console.log('####');
      });

      client.on('end', function() {
        console.log('client disconnected');
        stream.end();
      });

      return;
    }


/*
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
 */
  });

});
server.listen(3001, function() {
  console.log('HTTP and BinaryJS server started on port 3001');
});

