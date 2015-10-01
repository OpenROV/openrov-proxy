var fs = require('fs');
var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var url = require('url');
var exec = require('child_process').exec;
var BinaryServer = require('binaryjs').BinaryServer;
var bs = BinaryServer({ port: 3010 });
var currentClient = null;
var request = 0;

io.on('connection', function (socket) {
  console.log('Socket.IO: connected');
});

bs.on('connection', function (client) {
  console.log('Connection to client');
  // this could be improved as right now we only keep one client (browser).
  // Should not be an issue as we only should have one browser connected anyway.

  client.on('error', function (err) {
    console.log('Connection error to client:');
    console.dir(err);
  });
  client.on('close', function(){
    if (currentClient == client){
      currentClient = null;
    }
  });
  client.on('open', function(){
    console.log("Client connection is open");
  });
  currentClient = client;
});
bs.on('error', function(err){
  console.log("Binary.js service on rov had error:");
  console.dir(err);
});

app.addListener('connect', function (req, socket, head) {
  proxyReq(req, socket, head);
});

function handler (req,res){
  console.log("Process Request:" + req.url);
  if (url.parse(req.url).hostname !== null){
    if (currentClient === null){
      res.statusCode = 503;
      res.end();
      return;
    }

    proxyReq(req, res);
    return;
  }
  console.log("Internally Serving: " + url.parse(req.url).pathname);
  switch(url.parse(req.url).pathname) {
  case '/':
    fs.readFile(__dirname + '/public/index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
    break;
  case '/binary.min.js':
      fs.readFile(__dirname + '/node_modules/binaryjs/dist/binary.min.js',function (err, data){
          res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
          res.write(data);
          res.end();
      });
  break;
  case '/setdate':
    var queryparms = url.parse(req.url,true).query;
    if ('date' in queryparms){
      exec('date -s @' + queryparms.date, function(err, stdout, stderr) {
        if (err) {
          console.log("unable to set time");
          console.dir(err);
        }
        res.writeHead(200);
        res.end();
      });
    }
    break;
  default:
    res.statusCode = 400;
    res.end();
  }
};
app.listen(3000);
console.log('Server is listening');
// This function acts as a HTTP proxy.
// The request looks something like: GET HTTP://www.google.com
// We pass this on to to our proxy on the internet and they download it for us.
function proxyReq(req, res, head) {
  console.log('Proxing : ' + req.url);
  if (currentClient !== null) {
    var ssl = req.method === 'CONNECT';
    var url = (ssl ? 'https://' : '') + req.url;
    var streamid = request;
    request++;
    var stream = currentClient.createStream(JSON.stringify({
        version: 1,
        head: head,
        url: url,
        ssl: ssl
      }));
    console.log('Created stream for: ' + url);
    var headers_set = false;
    var response_parsed = false;
    for (var h in res.headers) {
      res.removeHeader(h);
    }
    if (ssl) {
      headers_set = true;
      response_parsed = true;
      stream.pipe(res);
      req.socket.pipe(stream);
    }
    req.on('close', function () {
      console.log("detected requester closed socket");
      stream.close();
    });
    req.on('end', function () {
      console.log("detected requester ended socket");
      stream.end();
    });
    stream.on('data', function (data) {
      if (!headers_set) {
        if (data == '\r\n' || data == '\n') {
          headers_set = true;
          // this is where some of the magic happens.
          // We sent the url to the proxy and the proxy starts a download
          // of a file and pipes the response to us.
          // Thanks to JavaScript streams, we can just pipe the data on towards our
          // client.
          stream.pipe(res);
          req.socket.pipe(stream);
        } else {
          var headerparts = data.split(/:(.+)?/);
          if (response_parsed) {
            headerparts[0] = headerparts[0].charAt(0).toUpperCase() + headerparts[0].slice(1);
            res.setHeader(headerparts[0], headerparts[1]);
          } else {
            res.statusCode = data.split(' ')[1];
            res.statusMessage = data.split(' ')[2];
            response_parsed = true;
          }
        }
      }
    });
    stream.on('end', function () {
      // When the proxy tells us everything was sent, we end the response to the client.
      res.end();
    });
    stream.on('close', function () {
      // When the proxy tells us everything was sent, we end the response to the client.
      res.end();
    });
  } else {
    console.log('No client connected!');
    res.statusCode = 500;
    res.end('No client connected!');
  }
}
