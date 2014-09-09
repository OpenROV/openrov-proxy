var fs = require('fs');
var app = require('express')();
var http = require('http').Server(app);
var https = require('https');
var BinaryServer = require('binaryjs').BinaryServer;
var bs = BinaryServer({server: http});

var currentClient = null;

bs.on('connection', function(client) {
  console.log('Connection to client');
  // this could be improved as right now we only keep one client (browser).
  // Should not be an issue as we only should have one browser connected anyway.
  currentClient = client;
});

app.use(function(req, res){
  if (req.url == '/' ) { // if the request is for '/' we send the index file
    res.sendfile(__dirname + '/public/index.html');
  }
  // otherwise we proxying the request
  else { proxyReq(req, res); }
});

http.addListener('connect', function(req, socket, head) {
  proxyReq(req, socket, head);
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});

// This function acts as a HTTP proxy.
// The request looks something like: GET HTTP://www.google.com
// We pass this on to to our proxy on the internet and they download it for us.
function proxyReq(req, res, head) {
  console.log("Request: " + req.url);

  if (currentClient !== null) {
    var ssl = req.method === 'CONNECT';
    var url = (ssl ? 'https://' : '') + req.url;
    var stream = currentClient.createStream( JSON.stringify({ head: head, url: url, ssl: ssl }) );
    console.log("Created stream for: " + url);
    res.statusCode = 200;

    stream.on('data', function(data) {
      // error handling
      if (data[0] == '{' && data[data.length-1] == '}') {
        error = JSON.parse(data);
        console.log("Error occurd " + JSON.stringify(error.error) + ' ' + error.statusCode);
        res.statusCode = error.statusCode === 0 ? 500 : error.statusCode;
        res.end("Error");
      }
    });

    // this is where some of the magic happens.
    // We sent the url to the proxy and the proxy starts a download
    // of a file and pipes the response to us.
    // Thanks to JavaScript streams, we can just pipe the data on towards our
    // client.
    stream.pipe(res);
    req.socket.pipe(stream);

    stream.on('end', function() {
      // When the proxy tells us everything was sent, we end the response to the client.
      res.end();
      stream.destroy();
    });
  }
  else {
    console.log('No client connected!');
    res.statusCode = 500;
    res.end("No client connected!");
  }
}
