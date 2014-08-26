var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
  console.log('a user connected');
});

var _currentSocket = undefined;
io.on('connection', function(socket){
  console.log('a user connected');
  _currentSocket = socket; // put in list
  socket.on('disconnect', function(){
    console.log('user disconnected');
   _curentSocket = null;
  });
});

function proxyReq(req, res) {
  console.log("Request: " + req.url);
  if (_currentSocket !== undefined) {  
   var chunkNr = 0;
   // thanks to Socket.IO magic, we can pass a function with the socket message
   // that, in escense, is request/response.
   // Once the proxy on the server has retrieved the file, it is passed as a binary buffer
   // in the 'data' argument of the callback function below.
   // essentially, the server 'executes' this function, but it is executed in the context here. 
    _currentSocket.emit('request', req.url); 
    res.writeHead(200, { "Content-Type": 'application/octet-stream' });  
    _currentSocket.on('chunk', function(data) {
      res.write(data.chunk, 'binary');
      console.log('received chunk #' + chunkNr++ + ' of data');
    });
    _currentSocket.on('done', function(data) {
      res.end();
    });
  }
  else {
    res.statusCode = 500;
    res.end("There was no browser connected, check that there is a ROV connected");
  }
};

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

