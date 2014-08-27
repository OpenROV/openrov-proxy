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
      console.log('Done');
      stream.end();
    })
      .pipe(stream);
  });

});
server.listen(3001);
console.log('HTTP and BinaryJS server started on port 3001');

/*var io = require('socket.io')(3001);
var http = require('http');
var URL = require('url');

io.on('connection', function(socket){

	console.log('Connection');
	socket.on('download', function(urlData) {
		console.log('request for downloading: ' + urlData);

		var url = URL.parse(urlData);

                var chunkNr = 0;
		callback = function(response) {
		  //another chunk of data has been recieved, so append it to `str`
		  response.on('data', function (chunk) {
                    console.log('Chunk #' + chunkNr + ' received from ' + urlData);
		    socket.emit('chunk', {url: urlData, chunk: chunk, done: false});
                    chunkNr = chunkNr + 1;
		  });

		  //the whole response has been recieved, so we just print it out here
		  response.on('end', function () {
		    console.log('Done downloading ' + urlData + '.');
                    socket.emit('done',{url: urlData, done: true});
		  });
		}
		http.request(url, callback).end();
	});
});

*/