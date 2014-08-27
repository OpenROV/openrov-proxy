var app = require('express')();
var http = require('http').Server(app);
var BinaryServer = require('binaryjs').BinaryServer;
var bs = BinaryServer({server: http});

var currentClient = null;

function proxyReq(req, res) {
  console.log("Request: " + req.url);
  if (currentClient !== null) {
    var stream = currentClient.createStream(req.url);
    console.log("Created stream for: " + req.url);
    res.statusCode = 200;
    stream.pipe(res);
    stream.on('end', function() {
      res.end();
    });
  }
  else {
    console.log('No client connected!');
    res.statusCode = 500;
    res.end("No client connected!");
  }
}

bs.on('connection', function(client) {
  console.log('Connection to client');
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

