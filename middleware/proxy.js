var io = require('socket.io')(3001);
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

