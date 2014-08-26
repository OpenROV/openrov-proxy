var io = require('socket.io')(3001);
var request = require('request');

io.on('connection', function(socket){

	console.log('Connection');
	socket.on('download', function(url, clbk) {
		console.log('request for downloading: ' + url);
		var options= {url: url, encoding: null};

                function callback(error, response, body) {
                  if (!error && response.statusCode == 200) {
		    console.log('Received url: ' + url + ' Body length: ' + body.length);
                    clbk({url: url, content: body});
                  }
                  else {
                    console.log('Error: ' + error);
                  }
                }
                request(options, callback);
	});
});

