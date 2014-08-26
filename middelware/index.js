var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var connect = require('connect');
var httpProxy = require('http-proxy');
var fs = require('fs');
var path = require('path');

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
    _currentSocket.emit('request', req.url, function(data) { 
      console.log('received data from server: ' + data.url); 
      res.statusCode = 200;
      res.end(data.content);
    });
  }
};

app.use(function(req, res){
  console.log('foo');
  if (req.url == '/' ) {
    res.sendfile('./public/index.html');
  }
  else { proxyReq(req, res); }
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

httpProxy.createServer({
  target: {
    host: 'localhost',
    port: 3000
  },
  ssl: {
    key: fs.readFileSync(path.join('certs', 'key.pem'), 'utf8'),
    cert: fs.readFileSync(path.join('certs', 'key-cert.pem'), 'utf8')
  }
}).listen(3003);
