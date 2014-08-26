var util = require('util'),
    colors = require('colors'),
    http = require('http'),
    httpProxy = require('http-proxy');

var welcome = [
  '#    # ##### ##### #####        #####  #####   ####  #    # #   #',
  '#    #   #     #   #    #       #    # #    # #    #  #  #   # # ',  
  '######   #     #   #    # ##### #    # #    # #    #   ##     #  ',   
  '#    #   #     #   #####        #####  #####  #    #   ##     #  ',   
  '#    #   #     #   #            #      #   #  #    #  #  #    #  ',   
  '#    #   #     #   #            #      #    #  ####  #    #   #  '
].join('\n');

util.puts(welcome.rainbow.bold);

//
// Basic Http Proxy Server
//
httpProxy.createServer({
  target:'http://localhost:9005'
}).listen(8005);

//
// Target Http Server
//
http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2));
  res.end();
}).listen(9005);

util.puts('http proxy server'.blue + ' started '.green.bold + 'on port '.blue + '8005'.yellow);
util.puts('http server '.blue + 'started '.green.bold + 'on port '.blue + '9005 '.yellow);
