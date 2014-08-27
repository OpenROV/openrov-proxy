var app = require('express')();
var http = require('http').Server(app);
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
    res.sendfile('./public/index.html');
  }
  // otherwise we proxying the request
  else { proxyReq(req, res); }
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

// This function acts as a HTTP proxy.
// The request looks something like: GET HTTP://www.google.com
// We pass this on to to our proxy on the internet and they download it for us.
function proxyReq(req, res) {
  console.log("Request: " + req.url);

  if (currentClient !== null) {
    var stream = currentClient.createStream(req.url);
    console.log("Created stream for: " + req.url);
    res.statusCode = 200;

    // this is where some of the magic happens.
    // We sent the url to the proxy and the proxy starts a download
    // of a file and pipes the response to us.
    // Thanks to JavaScript streams, we can just pipe the data on towards our
    // client.
    stream.pipe(res);
    // TODO: Error handling

    stream.on('end', function() {
      // When the proxy tells us everything was sent, we end the response to the client.
      res.end();
    });
  }
  else {
    console.log('No client connected!');
    res.statusCode = 500;
    res.end("No client connected!");
  }
}
