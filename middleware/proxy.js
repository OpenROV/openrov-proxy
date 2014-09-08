var url = require('url');
var net = require('net');
var http = require('http');
var BinaryServer = require('binaryjs').BinaryServer;
var express = require('express');
var request = require('request');

var app = express();
var server = http.createServer(app);
var bs = BinaryServer({server: server});
var Tls = require('tls');

bs.on('connection', function(client){
  console.log('Connection to client');
  // Incoming stream from browsers
  client.on('stream', function(stream, meta) {
    if (meta.indexOf('{') == 0) {
      var req = JSON.parse(meta);
      var requestUrl = req.url;
      console.log('Got SSL connection request to ' + requestUrl);
      var srvUrl = url.parse(requestUrl );
      console.log(srvUrl.port);

      stream.write('HTTP/1.1 200 Connection Established\r\n' +
        'Proxy-agent: Node-Proxy\r\n' +
        '\r\n');

      function connected(streamServer) {
        if (streamServer) {
          // socket connected
          var getReq2 = 'GET ' + srvUrl.path + ' HTTP/1.1\n\rHost: ' + srvUrl.hostname + ':' + srvUrl.port + '\n\r\n\r'
          var getReq = "GET / HTTP/1.0\n\rHost: encrypted.google.com:443\n\r\n\r";
          console.log(getReq);
          console.log(getReq2);
          streamServer.write(getReq2);
        } else {
          console.log("Connection failed");
        }
      }

      // needed to keep socket variable in scope
      var dummy = {};

// try to connect to the server
      console.log('Trying to connect: ' + srvUrl.port + ' '+ srvUrl.hostname);
      dummy.socket = Tls.connect(srvUrl.port, srvUrl.hostname, function() {
        console.log('connected');
        // callback called only after successful socket connection
        dummy.connected = true;
        if (dummy.socket.authorized) {
          console.log('authorised');
          // authorization successful
          dummy.socket.setEncoding('utf-8');
          connected(dummy.socket);
        } else {
          console.log('unauthorised');
          // authorization failed
          console.log(dummy.socket.authorizationError);
          connected(null);
        }
      });

      dummy.socket.addListener('data', function(data) {
        // received data
        stream.write(data);
        console.log(data);
      });

      dummy.socket.addListener('error', function(error) {
        if (!dummy.connected) {
          // socket was not connected, notify callback
          connected(null);
        }
        console.log("FAIL");
        console.log(error);
      });

      dummy.socket.addListener('close', function() {
        console.log('CLOSE');
        stream.close();
        // do something
      });
/*
      var cts = Tls.connect(
        {
          host: srvUrl.hostname,
          port: srvUrl.port
//          socket: stream
        },
        function()
        {
          var getReq = 'GET ' + srvUrl.path + ' HTTP/1.1\r\nHost: ' + srvUrl.hostname + '\r\n'
          console.log(getReq);
          cts.write(getReq);

          stream.pipe(cts);
          cts.pipe(stream);
        }
      );

      cts.on('data', function(data)
      {
        console.log(data.toString());
      });
      cts.on('end', function() {
        stream.end();
      });
*/

/*
      var srvSocket = net.connect(srvUrl.port, srvUrl.hostname, function() {
        stream.write('HTTP/1.1 200 Connection Established\r\n' +
          'Proxy-agent: Node-Proxy\r\n' +
          '\r\n');
        console.log('##########' + req.head);
        //srvSocket.write(req.head);
        srvSocket.pipe(stream);
        stream.pipe(srvSocket);
      });
*/
      return;
    }


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

